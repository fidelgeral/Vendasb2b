import { query } from "./db.js";

// Padrão por papel — TEM de ser igual ao do frontend (web/src/lib/permissions.js).
const PADRAO_POR_ROLE = {
  dono: () => true,
  gerente: (id) => id !== "gerirEquipa",
  caixa: (id) =>
    ["vender", "guardarPedido", "cotacao", "caixaAbrirFechar", "caixaEntrada", "caixaSaida", "verMovimentos", "produtoVer", "clienteGerir", "fiadoReceber"].includes(id),
  cozinha: (id) => ["verMovimentos", "produtoVer"].includes(id),
};

export function temPermissao(role, permissions, permId) {
  if (role === "dono") return true;
  const p = permissions || {};
  if (Object.prototype.hasOwnProperty.call(p, permId)) return !!p[permId];
  const padrao = PADRAO_POR_ROLE[role] || (() => false);
  return padrao(permId);
}

// Middleware: exige que o funcionário com sessão tenha a permissão `permId`.
// O super-admin passa sempre. As permissões são lidas da BD a cada pedido, para
// qualquer alteração ter efeito imediato (sem esperar novo login).
export function requirePermission(permId) {
  return async (req, res, next) => {
    try {
      if (req.auth?.type === "super") return next();
      if (req.auth?.type !== "employee") return res.status(403).json({ error: "Sem permissão para esta acção." });
      // O dono/gerente de um grupo acede às filiais (groupBusinessIds, já validado
      // pelo requireBusiness), por isso o funcionário vive no negócio-base e não
      // na filial do URL. Funcionários desactivados perdem o acesso de imediato.
      const emp = (
        await query("SELECT role, permissions, business_id FROM employees WHERE id = $1 AND active = true", [req.auth.employeeId])
      ).rows[0];
      if (!emp) return res.status(403).json({ error: "Sem permissão para esta acção." });
      const grupo = Array.isArray(req.auth.groupBusinessIds) && req.auth.groupBusinessIds.length ? req.auth.groupBusinessIds : [emp.business_id];
      if (emp.business_id !== req.params.businessId && !grupo.includes(req.params.businessId)) {
        return res.status(403).json({ error: "Sem acesso a este negócio." });
      }
      if (temPermissao(emp.role, emp.permissions, permId)) return next();
      return res.status(403).json({ error: "Não tem permissão para esta acção." });
    } catch (e) {
      return res.status(500).json({ error: "Erro ao verificar permissões." });
    }
  };
}
