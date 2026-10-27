import { Router } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { z } from "zod";
import { query } from "../db.js";
import { verifyPassword, hashPassword } from "../auth/hash.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/middleware.js";

function generateRefreshToken() { return crypto.randomBytes(64).toString("hex"); }
const REFRESH_DAYS = 30;
const ACCESS_EXPIRES = "2h";

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

const superLoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

authRouter.post("/super/login", loginLimiter, async (req, res) => {
  const parsed = superLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Email e senha são obrigatórios." });
  const { email, password } = parsed.data;
  const { rows } = await query("SELECT * FROM super_admins WHERE email = $1", [email.toLowerCase()]);
  const admin = rows[0];
  const ok = admin && (await verifyPassword(password, admin.password_hash));
  await query(
    "INSERT INTO login_attempts (email, success, ip, user_agent, login_type) VALUES ($1,$2,$3,$4,'super')",
    [email.toLowerCase(), !!ok, req.ip, (req.headers["user-agent"] || "").slice(0, 255)]
  );
  if (!ok) return res.status(401).json({ error: "Email ou senha incorrectos." });
  const token = signToken({ type: "super", adminId: admin.id, email: admin.email }, ACCESS_EXPIRES);
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400000);
  await query("INSERT INTO refresh_tokens (token, super_admin_id, expires_at) VALUES ($1,$2,$3)", [refreshToken, admin.id, expiresAt]);
  res.json({ token, refreshToken, admin: { id: admin.id, email: admin.email } });
});

const employeeLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// O email de cada funcionário é único em toda a plataforma (não só dentro do
// seu negócio), por isso o login não precisa de pedir nenhum código de negócio.
authRouter.post("/auth/login", loginLimiter, async (req, res) => {
  const parsed = employeeLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados de login inválidos." });
  const { email, password } = parsed.data;

  const emp = (
    await query(
      `SELECT e.*, b.name AS business_name, b.active AS business_active
       FROM employees e JOIN businesses b ON b.id = e.business_id
       WHERE lower(e.email) = lower($1) AND e.active = true`,
      [email]
    )
  ).rows[0];
  const ok = emp && (await verifyPassword(password, emp.password_hash));
  await query(
    "INSERT INTO login_attempts (email, success, ip, user_agent, employee_id, business_id, login_type) VALUES ($1,$2,$3,$4,$5,$6,'employee')",
    [email.toLowerCase(), !!ok, req.ip, (req.headers["user-agent"] || "").slice(0, 255), ok ? emp.id : null, ok ? emp.business_id : null]
  );
  if (!ok) return res.status(401).json({ error: "Email ou senha incorrectos." });
  if (!emp.business_active) return res.status(403).json({ error: "Conta de negócio inactiva." });

  const demoBiz = (await query("SELECT is_demo, demo_expires_at FROM businesses WHERE id = $1", [emp.business_id])).rows[0];
  if (demoBiz && demoBiz.is_demo && demoBiz.demo_expires_at && new Date(demoBiz.demo_expires_at) < new Date()) {
    return res.status(403).json({ error: "Conta demonstração expirada. Contacte o representante VendasB2B para activar a sua conta." });
  }

  let filiais = [{ id: emp.business_id, name: emp.business_name }];
  if (emp.role === "dono" || emp.role === "gerente") {
    const biz = (await query("SELECT id, name, parent_business_id FROM businesses WHERE id = $1", [emp.business_id])).rows[0];
    const rootId = biz.parent_business_id || biz.id;
    const group = (
      await query(
        "SELECT id, name FROM businesses WHERE active = true AND (id = $1 OR parent_business_id = $1) ORDER BY (id = $1) DESC, name",
        [rootId]
      )
    ).rows;
    if (group.length > 1) filiais = group;
  }
  if (emp.allowed_filiais && emp.allowed_filiais.length > 0) {
    filiais = filiais.filter((f) => emp.allowed_filiais.includes(f.id));
    if (!filiais.length) filiais = [{ id: emp.business_id, name: emp.business_name }];
  }
  const groupBusinessIds = filiais.map((f) => f.id);

  const token = signToken({ type: "employee", businessId: emp.business_id, employeeId: emp.id, role: emp.role, name: emp.name, groupBusinessIds }, ACCESS_EXPIRES);
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400000);
  await query("INSERT INTO refresh_tokens (token, employee_id, business_id, expires_at) VALUES ($1,$2,$3,$4)", [refreshToken, emp.id, emp.business_id, expiresAt]);
  res.json({
    token,
    refreshToken,
    business: { id: emp.business_id, name: emp.business_name },
    employee: { id: emp.id, name: emp.name, role: emp.role, email: emp.email },
    filiais,
  });
});

authRouter.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: "Refresh token em falta." });

  const rt = (await query("SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false", [refreshToken])).rows[0];
  if (!rt || new Date(rt.expires_at) < new Date()) {
    if (rt) await query("UPDATE refresh_tokens SET revoked = true WHERE id = $1", [rt.id]);
    return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
  }

  // Revogar o token usado e gerar um novo (rotation)
  await query("UPDATE refresh_tokens SET revoked = true WHERE id = $1", [rt.id]);
  const newRefresh = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 86400000);

  if (rt.super_admin_id) {
    const admin = (await query("SELECT id, email FROM super_admins WHERE id = $1", [rt.super_admin_id])).rows[0];
    if (!admin) return res.status(401).json({ error: "Conta não encontrada." });
    const token = signToken({ type: "super", adminId: admin.id, email: admin.email }, ACCESS_EXPIRES);
    await query("INSERT INTO refresh_tokens (token, super_admin_id, expires_at) VALUES ($1,$2,$3)", [newRefresh, admin.id, expiresAt]);
    return res.json({ token, refreshToken: newRefresh });
  }

  const emp = (await query(
    `SELECT e.*, b.name AS business_name, b.active AS business_active
     FROM employees e JOIN businesses b ON b.id = e.business_id
     WHERE e.id = $1 AND e.active = true`, [rt.employee_id]
  )).rows[0];
  if (!emp || !emp.business_active) return res.status(401).json({ error: "Conta inactiva." });

  let filiais = [{ id: emp.business_id, name: emp.business_name }];
  if (emp.role === "dono" || emp.role === "gerente") {
    const biz = (await query("SELECT id, parent_business_id FROM businesses WHERE id = $1", [emp.business_id])).rows[0];
    const rootId = biz.parent_business_id || biz.id;
    const group = (await query("SELECT id, name FROM businesses WHERE active = true AND (id = $1 OR parent_business_id = $1) ORDER BY (id = $1) DESC, name", [rootId])).rows;
    if (group.length > 1) filiais = group;
  }
  if (emp.allowed_filiais && emp.allowed_filiais.length > 0) {
    filiais = filiais.filter((f) => emp.allowed_filiais.includes(f.id));
    if (!filiais.length) filiais = [{ id: emp.business_id, name: emp.business_name }];
  }
  const groupBusinessIds = filiais.map((f) => f.id);
  const token = signToken({ type: "employee", businessId: emp.business_id, employeeId: emp.id, role: emp.role, name: emp.name, groupBusinessIds }, ACCESS_EXPIRES);
  await query("INSERT INTO refresh_tokens (token, employee_id, business_id, expires_at) VALUES ($1,$2,$3,$4)", [newRefresh, emp.id, emp.business_id, expiresAt]);
  res.json({ token, refreshToken: newRefresh });
});

authRouter.post("/auth/logout", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (refreshToken) await query("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [refreshToken]);
  res.json({ ok: true });
});

authRouter.get("/auth/me", requireAuth, async (req, res) => {
  res.json({ auth: req.auth });
});

// --- Recuperação de senha ---
const forgotLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });

authRouter.post("/auth/forgot-password", forgotLimiter, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email obrigatório." });
  const emp = (await query("SELECT id, name, email FROM employees WHERE lower(email) = lower($1) AND active = true", [email])).rows[0];
  // Resposta genérica para não revelar se o email existe
  if (!emp) return res.json({ ok: true });
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  await query("DELETE FROM password_reset_tokens WHERE employee_id = $1", [emp.id]);
  await query("INSERT INTO password_reset_tokens (employee_id, code, expires_at) VALUES ($1,$2,$3)", [emp.id, code, expiresAt]);
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "VENDASB2B <onboarding@resend.dev>",
          to: [emp.email],
          subject: "Código de recuperação — VENDASB2B",
          html: `<div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;text-align:center">
            <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:20px;border-radius:12px 12px 0 0">
              <div style="font-size:20px;font-weight:bold">VENDASB2B</div>
            </div>
            <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px">
              <p>Olá <strong>${emp.name}</strong>,</p>
              <p>O seu código de recuperação é:</p>
              <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#4F46E5;margin:16px 0">${code}</div>
              <p style="color:#64748B;font-size:13px">Este código expira em 15 minutos.</p>
            </div>
          </div>`,
        }),
      });
    } catch {}
  }
  res.json({ ok: true });
});

const passwordRule = z.string().min(6).regex(/[a-zA-Z]/).regex(/[0-9]/);

authRouter.post("/auth/reset-password", forgotLimiter, async (req, res) => {
  const { email, code, newPassword } = req.body || {};
  if (!email || !code || !newPassword) return res.status(400).json({ error: "Dados em falta." });
  const parsed = passwordRule.safeParse(newPassword);
  if (!parsed.success) return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres, com letras e números." });
  const emp = (await query("SELECT id FROM employees WHERE lower(email) = lower($1) AND active = true", [email])).rows[0];
  if (!emp) return res.status(400).json({ error: "Código inválido ou expirado." });
  const tok = (await query("SELECT * FROM password_reset_tokens WHERE employee_id = $1 AND code = $2 AND expires_at > NOW()", [emp.id, code])).rows[0];
  if (!tok) return res.status(400).json({ error: "Código inválido ou expirado." });
  const hash = await hashPassword(newPassword);
  await query("UPDATE employees SET password_hash = $1 WHERE id = $2", [hash, emp.id]);
  await query("DELETE FROM password_reset_tokens WHERE employee_id = $1", [emp.id]);
  res.json({ ok: true });
});

// --- Conta demonstração ---
const demoLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false });

const demoSchema = z.object({
  businessName: z.string().min(2).max(200),
  ownerName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional().default(""),
  representative: z.string().min(2).max(200),
});

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < 8; i++) pwd += chars[crypto.randomInt(chars.length)];
  return pwd;
}

authRouter.post("/auth/demo", demoLimiter, async (req, res) => {
  const parsed = demoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  const { businessName, ownerName, email, phone, representative } = parsed.data;

  const existing = (await query("SELECT id FROM employees WHERE lower(email) = lower($1)", [email])).rows[0];
  if (existing) return res.status(409).json({ error: "Já existe uma conta com este email." });

  const password = generatePassword();
  const hash = await hashPassword(password);
  const slug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + crypto.randomInt(10000);

  const biz = (await query(
    `INSERT INTO businesses (name, slug, is_demo, demo_expires_at, demo_representative, demo_contact_email, demo_contact_phone, subscription_status, plan, config)
     VALUES ($1, $2, true, now() + interval '3 days', $3, $4, $5, 'ativo', 'demo', '{}')
     RETURNING id`,
    [businessName, slug, representative, email, phone]
  )).rows[0];

  await query(
    `INSERT INTO employees (business_id, name, email, password_hash, role, active)
     VALUES ($1, $2, $3, $4, 'dono', true)`,
    [biz.id, ownerName, email.toLowerCase(), hash]
  );

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "VENDASB2B <onboarding@resend.dev>",
          to: [email],
          subject: "Conta demonstração VENDASB2B — Os seus dados de acesso",
          html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
            <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
              <div style="font-size:22px;font-weight:bold">VENDASB2B</div>
              <div style="font-size:13px;opacity:.85">Conta Demonstração</div>
            </div>
            <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px">
              <p>Olá <strong>${ownerName}</strong>,</p>
              <p>A sua conta demonstração foi criada com sucesso! Tem <strong>3 dias</strong> para avaliar o sistema.</p>
              <div style="background:#F8FAFC;border-radius:8px;padding:16px;margin:16px 0">
                <p style="margin:4px 0"><strong>Negócio:</strong> ${businessName}</p>
                <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
                <p style="margin:4px 0"><strong>Senha:</strong> <code style="background:#E0E7FF;padding:2px 8px;border-radius:4px;font-size:16px;letter-spacing:1px">${password}</code></p>
              </div>
              <p style="color:#64748B;font-size:13px">Representante: ${representative}</p>
              <p style="color:#64748B;font-size:12px">Após os 3 dias, contacte o seu representante para activar a subscrição.</p>
            </div>
          </div>`,
        }),
      });
    } catch {}
  }

  res.status(201).json({ ok: true, email, password, businessName });
});
