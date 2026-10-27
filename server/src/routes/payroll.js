import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { requirePermission } from "../permissions.js";
import { logAudit, authEmployee } from "../audit.js";

export const payrollRouter = Router({ mergeParams: true });
payrollRouter.use(requireAuth, requireBusiness);

const schema = z.object({
  employeeId: z.string().uuid(),
  employeeName: z.string().min(1),
  mes: z.number().int().min(1).max(12),
  ano: z.number().int().min(2020).max(2099),
  salarioBase: z.number().min(0),
  bonus: z.number().min(0).default(0),
  descontos: z.number().min(0).default(0),
  notas: z.string().optional().default(""),
});

payrollRouter.get("/payroll", async (req, res) => {
  const businessId = req.params.businessId;
  const ano = parseInt(req.query.ano) || new Date().getFullYear();
  const mes = parseInt(req.query.mes) || null;
  let sql = "SELECT * FROM payroll WHERE business_id = $1 AND ano = $2";
  const params = [businessId, ano];
  if (mes) { sql += " AND mes = $3"; params.push(mes); }
  sql += " ORDER BY mes DESC, employee_name ASC";
  const rows = (await query(sql, params)).rows;
  res.json({ payroll: rows });
});

payrollRouter.post("/payroll", requirePermission("gerirEquipa"), async (req, res) => {
  const businessId = req.params.businessId;
  const f = schema.parse(req.body);
  const total = f.salarioBase + f.bonus - f.descontos;
  const dup = (await query(
    "SELECT 1 FROM payroll WHERE business_id = $1 AND employee_id = $2 AND mes = $3 AND ano = $4",
    [businessId, f.employeeId, f.mes, f.ano]
  )).rows.length;
  if (dup) return res.status(409).json({ error: "Já existe registo de salário para este funcionário neste mês." });
  await query(
    "INSERT INTO payroll (business_id, employee_id, employee_name, mes, ano, salario_base, bonus, descontos, total, notas, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
    [businessId, f.employeeId, f.employeeName, f.mes, f.ano, f.salarioBase, f.bonus, f.descontos, total, f.notas, authEmployee(req).name]
  );
  await logAudit({ businessId, employee: authEmployee(req), acao: "SALARIO", detalhe: `Processou salário de ${f.employeeName} (${f.mes}/${f.ano}): ${total.toFixed(2)} MT` });
  const rows = (await query("SELECT * FROM payroll WHERE business_id = $1 AND ano = $2 ORDER BY mes DESC, employee_name ASC", [businessId, f.ano])).rows;
  res.json({ payroll: rows });
});

payrollRouter.patch("/payroll/:id/pay", requirePermission("gerirEquipa"), async (req, res) => {
  const businessId = req.params.businessId;
  const row = (await query("SELECT * FROM payroll WHERE id = $1 AND business_id = $2", [req.params.id, businessId])).rows[0];
  if (!row) return res.status(404).json({ error: "Registo não encontrado." });
  await query("UPDATE payroll SET pago = true, pago_em = now() WHERE id = $1", [req.params.id]);
  await logAudit({ businessId, employee: authEmployee(req), acao: "SALARIO", detalhe: `Marcou salário de ${row.employee_name} (${row.mes}/${row.ano}) como pago` });
  res.json({ ok: true });
});

payrollRouter.delete("/payroll/:id", requirePermission("gerirEquipa"), async (req, res) => {
  const businessId = req.params.businessId;
  const row = (await query("SELECT * FROM payroll WHERE id = $1 AND business_id = $2", [req.params.id, businessId])).rows[0];
  if (!row) return res.status(404).json({ error: "Registo não encontrado." });
  await query("DELETE FROM payroll WHERE id = $1", [req.params.id]);
  await logAudit({ businessId, employee: authEmployee(req), acao: "SALARIO", detalhe: `Apagou salário de ${row.employee_name} (${row.mes}/${row.ano})` });
  res.json({ ok: true });
});
