import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness, requireRole } from "../auth/middleware.js";
import { hashPassword } from "../auth/hash.js";
import { buildStore } from "./store.js";

export const employeesRouter = Router({ mergeParams: true });
employeesRouter.use(requireAuth, requireBusiness, requireRole("dono"));

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

const employeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  role: z.enum(["dono", "gerente", "caixa", "cozinha"]).default("caixa"),
  docId: z.string().optional().default(""),
  password: z.string().min(4).optional(),
});

employeesRouter.post("/employees", async (req, res) => {
  const parsed = employeeSchema.safeParse(req.body);
  if (!parsed.success || !parsed.data.password) return res.status(400).json({ error: "Dados inválidos: a senha deve ter pelo menos 4 caracteres." });
  const f = parsed.data;
  const businessId = req.params.businessId;

  // O email é único em toda a plataforma (não só dentro deste negócio), pois é
  // ele que identifica a conta no ecrã de login (sem precisar de código de negócio).
  const dup = (await query("SELECT 1 FROM employees WHERE lower(email) = lower($1)", [f.email])).rows.length;
  if (dup) return res.status(409).json({ error: "Já existe uma conta com esse email noutro negócio ou nesta equipa." });

  const passwordHash = await hashPassword(f.password);
  await query(
    "INSERT INTO employees (business_id, name, email, phone, role, doc_id, password_hash) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [businessId, f.name, f.email.toLowerCase(), f.phone, f.role, f.docId, passwordHash]
  );
  await respond(res, businessId, 201);
});

const employeePatchSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["dono", "gerente", "caixa", "cozinha"]).optional(),
  docId: z.string().optional(),
  password: z.string().min(4).optional(),
});

employeesRouter.patch("/employees/:id", async (req, res) => {
  const parsed = employeePatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const f = parsed.data;
  const { businessId, id } = req.params;
  const existing = (await query("SELECT * FROM employees WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (!existing) return res.status(404).json({ error: "Utilizador não encontrado." });

  if (f.email) {
    const dup = (
      await query("SELECT 1 FROM employees WHERE lower(email) = lower($1) AND id <> $2", [f.email, id])
    ).rows.length;
    if (dup) return res.status(409).json({ error: "Já existe uma conta com esse email noutro negócio ou nesta equipa." });
  }

  const passwordHash = f.password ? await hashPassword(f.password) : existing.password_hash;
  await query(
    "UPDATE employees SET name=$1, email=$2, phone=$3, role=$4, doc_id=$5, password_hash=$6 WHERE id = $7",
    [
      f.name ?? existing.name, (f.email ?? existing.email).toLowerCase(), f.phone ?? existing.phone,
      f.role ?? existing.role, f.docId ?? existing.doc_id, passwordHash, id,
    ]
  );
  await respond(res, businessId);
});

employeesRouter.delete("/employees/:id", async (req, res) => {
  const { businessId, id } = req.params;
  await query("DELETE FROM employees WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});

employeesRouter.post("/employees/:id/toggle-active", async (req, res) => {
  const { businessId, id } = req.params;
  await query("UPDATE employees SET active = NOT active WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});
