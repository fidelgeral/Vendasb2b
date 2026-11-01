import { Router } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { query } from "../db.js";
import { requireAuth } from "../auth/middleware.js";
import { signToken } from "../auth/jwt.js";
import crypto from "crypto";

export const webauthnRouter = Router();

const RP_NAME = "VENDASB2B";
const RP_ID = process.env.WEBAUTHN_RP_ID || "vendasb2b.vercel.app";
const ORIGIN = process.env.WEBAUTHN_ORIGIN || "https://vendasb2b.vercel.app";

const challenges = new Map();
function storeChallenge(key, challenge) {
  challenges.set(key, { challenge, expires: Date.now() + 5 * 60 * 1000 });
  setTimeout(() => challenges.delete(key), 5 * 60 * 1000);
}
function getChallenge(key) {
  const entry = challenges.get(key);
  if (!entry || entry.expires < Date.now()) { challenges.delete(key); return null; }
  challenges.delete(key);
  return entry.challenge;
}

const REFRESH_DAYS = 30;
const ACCESS_EXPIRES = "2h";
function generateRefreshToken() { return crypto.randomBytes(64).toString("hex"); }

// --- Registo (requer autenticação) ---
webauthnRouter.post("/webauthn/register/options", requireAuth, async (req, res) => {
  const emp = (await query("SELECT id, name, email FROM employees WHERE id = $1", [req.auth.employeeId])).rows[0];
  if (!emp) return res.status(404).json({ error: "Utilizador não encontrado." });

  const existing = (await query("SELECT credential_id FROM webauthn_credentials WHERE employee_id = $1", [emp.id])).rows;
  const excludeCredentials = existing.map((c) => ({ id: c.credential_id, type: "public-key" }));

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: emp.email,
    userDisplayName: emp.name,
    attestationType: "none",
    excludeCredentials,
    authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "preferred" },
  });

  storeChallenge(`reg_${emp.id}`, options.challenge);
  res.json(options);
});

webauthnRouter.post("/webauthn/register/verify", requireAuth, async (req, res) => {
  const empId = req.auth.employeeId;
  const challenge = getChallenge(`reg_${empId}`);
  if (!challenge) return res.status(400).json({ error: "Sessão de registo expirada. Tente novamente." });

  try {
    const verification = await verifyRegistrationResponse({
      response: req.body.credential,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: "Verificação falhou." });
    }

    const { credential } = verification.registrationInfo;
    const deviceName = req.body.deviceName || "Dispositivo";

    await query(
      "INSERT INTO webauthn_credentials (employee_id, credential_id, public_key, counter, device_name) VALUES ($1, $2, $3, $4, $5)",
      [empId, credential.id, Buffer.from(credential.publicKey), credential.counter, deviceName]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Erro ao registar biometria: " + e.message });
  }
});

// --- Autenticação (público) ---
webauthnRouter.post("/webauthn/login/options", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email obrigatório." });

  const emp = (await query("SELECT id FROM employees WHERE lower(email) = lower($1) AND active = true", [email])).rows[0];
  if (!emp) return res.status(400).json({ error: "Nenhuma credencial biométrica encontrada." });

  const creds = (await query("SELECT credential_id FROM webauthn_credentials WHERE employee_id = $1", [emp.id])).rows;
  if (!creds.length) return res.status(400).json({ error: "Nenhuma credencial biométrica registada para este email." });

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: creds.map((c) => ({ id: c.credential_id, type: "public-key" })),
    userVerification: "required",
  });

  storeChallenge(`auth_${emp.id}`, options.challenge);
  res.json({ ...options, employeeId: emp.id });
});

webauthnRouter.post("/webauthn/login/verify", async (req, res) => {
  const { credential, employeeId } = req.body;
  if (!credential || !employeeId) return res.status(400).json({ error: "Dados em falta." });

  const challenge = getChallenge(`auth_${employeeId}`);
  if (!challenge) return res.status(400).json({ error: "Sessão expirada. Tente novamente." });

  const stored = (await query("SELECT * FROM webauthn_credentials WHERE employee_id = $1 AND credential_id = $2", [employeeId, credential.id])).rows[0];
  if (!stored) return res.status(400).json({ error: "Credencial não reconhecida." });

  try {
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: stored.credential_id,
        publicKey: new Uint8Array(stored.public_key),
        counter: Number(stored.counter),
      },
    });

    if (!verification.verified) return res.status(400).json({ error: "Verificação biométrica falhou." });

    await query("UPDATE webauthn_credentials SET counter = $1 WHERE id = $2", [verification.authenticationInfo.newCounter, stored.id]);

    const emp = (await query(
      `SELECT e.*, b.name AS business_name, b.active AS business_active
       FROM employees e JOIN businesses b ON b.id = e.business_id
       WHERE e.id = $1 AND e.active = true`, [employeeId]
    )).rows[0];
    if (!emp) return res.status(401).json({ error: "Conta inactiva." });
    if (!emp.business_active) return res.status(403).json({ error: "Conta de negócio inactiva." });

    const demoBiz = (await query("SELECT is_demo, demo_expires_at FROM businesses WHERE id = $1", [emp.business_id])).rows[0];
    if (demoBiz?.is_demo && demoBiz.demo_expires_at && new Date(demoBiz.demo_expires_at) < new Date()) {
      return res.status(403).json({ error: "Conta demonstração expirada." });
    }

    let filiais = [{ id: emp.business_id, name: emp.business_name }];
    if (emp.role === "dono" || emp.role === "gerente") {
      const biz = (await query("SELECT id, parent_business_id FROM businesses WHERE id = $1", [emp.business_id])).rows[0];
      const rootId = biz.parent_business_id || biz.id;
      const group = (await query("SELECT id, name FROM businesses WHERE active = true AND (id = $1 OR parent_business_id = $1) ORDER BY (id = $1) DESC, name", [rootId])).rows;
      if (group.length > 1) filiais = group;
    }
    if (emp.allowed_filiais?.length > 0) {
      filiais = filiais.filter((f) => emp.allowed_filiais.includes(f.id));
      if (!filiais.length) filiais = [{ id: emp.business_id, name: emp.business_name }];
    }
    const groupBusinessIds = filiais.map((f) => f.id);

    await query(
      "INSERT INTO login_attempts (email, success, ip, user_agent, employee_id, business_id, login_type) VALUES ($1,$2,$3,$4,$5,$6,'biometric')",
      [emp.email, true, req.ip, (req.headers["user-agent"] || "").slice(0, 255), emp.id, emp.business_id]
    );

    const token = signToken({ type: "employee", businessId: emp.business_id, employeeId: emp.id, role: emp.role, name: emp.name, groupBusinessIds }, ACCESS_EXPIRES);
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400000);
    await query("INSERT INTO refresh_tokens (token, employee_id, business_id, expires_at) VALUES ($1,$2,$3,$4)", [refreshToken, emp.id, emp.business_id, expiresAt]);

    res.json({
      token, refreshToken,
      business: { id: emp.business_id, name: emp.business_name },
      employee: { id: emp.id, name: emp.name, role: emp.role, email: emp.email },
      filiais,
    });
  } catch (e) {
    res.status(400).json({ error: "Erro na autenticação biométrica: " + e.message });
  }
});

// --- Listar/remover credenciais ---
webauthnRouter.get("/webauthn/credentials", requireAuth, async (req, res) => {
  const creds = (await query(
    "SELECT id, device_name, created_at FROM webauthn_credentials WHERE employee_id = $1 ORDER BY created_at DESC",
    [req.auth.employeeId]
  )).rows;
  res.json(creds);
});

webauthnRouter.delete("/webauthn/credentials/:id", requireAuth, async (req, res) => {
  await query("DELETE FROM webauthn_credentials WHERE id = $1 AND employee_id = $2", [req.params.id, req.auth.employeeId]);
  res.json({ ok: true });
});
