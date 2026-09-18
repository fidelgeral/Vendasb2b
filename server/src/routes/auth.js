import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { query } from "../db.js";
import { verifyPassword } from "../auth/hash.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth } from "../auth/middleware.js";

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
  if (!ok) return res.status(401).json({ error: "Email ou senha incorrectos." });
  const token = signToken({ type: "super", adminId: admin.id, email: admin.email });
  res.json({ token, admin: { id: admin.id, email: admin.email } });
});

const slugLookupSchema = z.object({ slug: z.string().min(1) });

authRouter.post("/auth/business-lookup", loginLimiter, async (req, res) => {
  const parsed = slugLookupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Indique o código do negócio." });
  const biz = (await query("SELECT id, name, active FROM businesses WHERE slug = $1", [parsed.data.slug.trim().toLowerCase()])).rows[0];
  if (!biz || !biz.active) return res.status(404).json({ error: "Negócio não encontrado." });
  res.json({ id: biz.id, name: biz.name });
});

const employeeLoginSchema = z.object({
  slug: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/auth/login", loginLimiter, async (req, res) => {
  const parsed = employeeLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados de login inválidos." });
  const { slug, email, password } = parsed.data;

  const biz = (await query("SELECT id, name, active FROM businesses WHERE slug = $1", [slug.trim().toLowerCase()])).rows[0];
  if (!biz || !biz.active) return res.status(403).json({ error: "Conta de negócio inactiva ou inexistente." });

  const emp = (
    await query("SELECT * FROM employees WHERE business_id = $1 AND lower(email) = lower($2) AND active = true", [biz.id, email])
  ).rows[0];
  const ok = emp && (await verifyPassword(password, emp.password_hash));
  if (!ok) return res.status(401).json({ error: "Email ou senha incorrectos." });

  const token = signToken({ type: "employee", businessId: biz.id, employeeId: emp.id, role: emp.role, name: emp.name });
  res.json({
    token,
    business: { id: biz.id, name: biz.name },
    employee: { id: emp.id, name: emp.name, role: emp.role, email: emp.email },
  });
});

authRouter.get("/auth/me", requireAuth, async (req, res) => {
  res.json({ auth: req.auth });
});
