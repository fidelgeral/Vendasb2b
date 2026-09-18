import { verifyToken } from "./jwt.js";

// Extrai e valida o token Bearer, define req.auth = { type: 'super' } ou
// { type: 'employee', businessId, employeeId, role }
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Sessão em falta." });
  try {
    req.auth = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}

export function requireSuperAdmin(req, res, next) {
  if (!req.auth || req.auth.type !== "super") return res.status(403).json({ error: "Apenas o super-admin pode fazer isto." });
  next();
}

// Garante que o :businessId do URL corresponde ao negócio do token (ou que é super-admin)
export function requireBusiness(req, res, next) {
  if (req.auth?.type === "super") return next();
  if (req.auth?.type !== "employee" || req.auth.businessId !== req.params.businessId) {
    return res.status(403).json({ error: "Sem acesso a este negócio." });
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (req.auth?.type === "super") return next();
    if (req.auth?.type !== "employee" || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Sem permissão para esta acção." });
    }
    next();
  };
}

export const ROLE_LABELS = { dono: "Administrador", gerente: "Gerente", caixa: "Operador de Caixa", cozinha: "Cozinha / Bar" };
export const canSeeFinance = (role) => role === "dono" || role === "gerente";
export const canDiscount = (role) => role === "dono" || role === "gerente";
export const canVoid = (role) => role === "dono" || role === "gerente";
export const canManageTeam = (role) => role === "dono";
