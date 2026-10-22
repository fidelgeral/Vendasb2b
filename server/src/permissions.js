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
      const emp = (
        await query("SELECT role, permissions FROM employees WHERE id = $1 AND business_id = $2", [req.auth.employeeId, req.params.businessId])
      ).rows[0];
      if (!emp) return res.status(403).json({ error: "Sem permissão para esta acção." });
      if (temPermissao(emp.role, emp.permissions, permId)) return next();
      return res.status(403).json({ error: "Não tem permissão para esta acção." });
    } catch (e) {
      return res.status(500).json({ error: "Erro ao verificar permissões." });
    }
  };
}
