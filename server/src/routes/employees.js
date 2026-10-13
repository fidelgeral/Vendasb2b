import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness, requireRole } from "../auth/middleware.js";
import { hashPassword } from "../auth/hash.js";
import { buildStore } from "./store.js";
import { logAudit, authEmployee } from "../audit.js";

export const employeesRouter = Router({ mergeParams: true });
employeesRouter.use(requireAuth, requireBusiness, requireRole("dono"));

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

// Garante que nunca se fica sem nenhum administrador (dono) activo — evita o
// bloqueio total do negócio (sem quem gira equipa/configurações).
async function outroDonoActivo(businessId, excluirId) {
  const n = (
    await query("SELECT COUNT(*)::int AS n FROM employees WHERE business_id = $1 AND role = 'dono' AND active = true AND id <> $2", [businessId, excluirId])
  ).rows[0].n;
  return n > 0;
}

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
  const novo = (
    await query(
      "INSERT INTO employees (business_id, name, email, phone, role, doc_id, password_hash) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      [businessId, f.name, f.email.toLowerCase(), f.phone, f.role, f.docId, passwordHash]
    )
  ).rows[0];
  await logAudit({ businessId, employee: authEmployee(req), acao: "EQUIPA", detalhe: `Adicionou o utilizador "${f.name}" (${f.role})`, entityType: "funcionario", entityId: novo.id });
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

  // Não permitir tirar o papel de "dono" ao último administrador activo.
  if (existing.role === "dono" && existing.active && f.role && f.role !== "dono" && !(await outroDonoActivo(businessId, id))) {
    return res.status(409).json({ error: "Este é o único administrador activo. Promova outro a Administrador antes de mudar o papel deste." });
  }

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
  const campos = { name: "name", email: "email", phone: "phone", role: "role", docId: "doc_id" };
  const mudancas = Object.keys(campos)
    .filter((k) => f[k] !== undefined && String(f[k] ?? "") !== String(existing[campos[k]] ?? ""))
    .map((k) => `${k}: "${existing[campos[k]] ?? ""}" → "${f[k] ?? ""}"`);
  if (f.password) mudancas.push("senha alterada");
  await logAudit({ businessId, employee: authEmployee(req), acao: "EQUIPA", detalhe: `Editou o utilizador "${f.name ?? existing.name}"${mudancas.length ? ` (${mudancas.join("; ")})` : ""}`, entityType: "funcionario", entityId: id });
  await respond(res, businessId);
});

employeesRouter.delete("/employees/:id", async (req, res) => {
  const { businessId, id } = req.params;
  const antes = (await query("SELECT name, role, active FROM employees WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (antes && antes.role === "dono" && antes.active && !(await outroDonoActivo(businessId, id))) {
    return res.status(409).json({ error: "Não pode remover o único administrador activo. Promova outro a Administrador primeiro." });
  }
  await query("DELETE FROM employees WHERE id = $1 AND business_id = $2", [id, businessId]);
  if (antes) await logAudit({ businessId, employee: authEmployee(req), acao: "EQUIPA", detalhe: `Removeu o utilizador "${antes.name}"`, entityType: "funcionario", entityId: id });
  await respond(res, businessId);
});

employeesRouter.post("/employees/:id/toggle-active", async (req, res) => {
  const { businessId, id } = req.params;
  const atual = (await query("SELECT role, active FROM employees WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (atual && atual.role === "dono" && atual.active && !(await outroDonoActivo(businessId, id))) {
    return res.status(409).json({ error: "Não pode desativar o único administrador activo." });
  }
  const row = (await query("UPDATE employees SET active = NOT active WHERE id = $1 AND business_id = $2 RETURNING name, active", [id, businessId])).rows[0];
  if (row) await logAudit({ businessId, employee: authEmployee(req), acao: "EQUIPA", detalhe: `${row.active ? "Ativou" : "Desativou"} o utilizador "${row.name}"`, entityType: "funcionario", entityId: id });
  await respond(res, businessId);
});
