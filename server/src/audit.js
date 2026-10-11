import { query as poolQuery } from "./db.js";

// Identifica quem está a fazer a acção (funcionário ou super-admin).
export function authEmployee(req) {
  return req.auth?.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };
}

// Regista uma entrada de auditoria ligada a uma entidade (fornecedor,
// categoria, produto, ...). `run` é a função de query a usar (a do pool por
// omissão, ou a de um cliente de transação).
export async function logAudit(fields, run) {
  const exec = run || poolQuery;
  const { businessId, employee, acao, detalhe, valor = 0, entityType = null, entityId = null } = fields;
  await exec(
    `INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor, entity_type, entity_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [businessId, employee?.id || null, employee?.name || "Sistema", acao, detalhe, valor, entityType, entityId]
  );
}
