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
  const { businessId, employee, acao, detalhe, valor = 0, entityType = null, entityId = null, ip = null, userAgent = null } = fields;
  await exec(
    `INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor, entity_type, entity_id, ip, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [businessId, employee?.id || null, employee?.name || "Sistema", acao, detalhe, valor, entityType, entityId, ip, userAgent ? String(userAgent).slice(0, 500) : null]
  );
}

export function reqMeta(req) {
  return { ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null, userAgent: req.headers["user-agent"] || null };
}
