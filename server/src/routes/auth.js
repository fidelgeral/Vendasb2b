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
  if (!ok) return res.status(401).json({ error: "Email ou senha incorrectos." });
  if (!emp.business_active) return res.status(403).json({ error: "Conta de negócio inactiva." });

  // Filiais: só o dono acede a várias lojas do mesmo grupo. O grupo é a sede
  // (parent) + todas as suas filiais; se este negócio for a sede, inclui-se a si
  // próprio + filhos. Para outros papéis, acede só ao seu negócio.
  let filiais = [{ id: emp.business_id, name: emp.business_name }];
  if (emp.role === "dono") {
    const biz = (await query("SELECT id, name, parent_business_id FROM businesses WHERE id = $1", [emp.business_id])).rows[0];
    const rootId = biz.parent_business_id || biz.id;
    const group = (
      await query(
        "SELECT id, name FROM businesses WHERE active = true AND (id = $1 OR parent_business_id = $1) ORDER BY (id = $1) DESC, name",
        [rootId]
      )
    ).rows;
    if (group.length) filiais = group;
  }
  const groupBusinessIds = filiais.map((f) => f.id);

  const token = signToken({ type: "employee", businessId: emp.business_id, employeeId: emp.id, role: emp.role, name: emp.name, groupBusinessIds });
  res.json({
    token,
    business: { id: emp.business_id, name: emp.business_name },
    employee: { id: emp.id, name: emp.name, role: emp.role, email: emp.email },
    filiais,
  });
});

authRouter.get("/auth/me", requireAuth, async (req, res) => {
  res.json({ auth: req.auth });
});
