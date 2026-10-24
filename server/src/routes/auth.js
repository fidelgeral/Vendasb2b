import { Router } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { z } from "zod";
import { query } from "../db.js";
import { verifyPassword } from "../auth/hash.js";
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
