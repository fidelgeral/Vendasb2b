import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";
import { requirePermission } from "../permissions.js";

export const configRouter = Router({ mergeParams: true });
// NOTA: a verificação de permissão fica em cada rota (não no .use), senão o
// middleware bloquearia pedidos de OUTROS routers montados no mesmo caminho.
configRouter.use(requireAuth, requireBusiness);

// Faz merge raso do corpo recebido dentro de businesses.config (cada Tab de
// configuração só envia a secção que alterou, ex.: { iva: {...} }).
configRouter.patch("/config", requirePermission("gerirConfig"), async (req, res) => {
  const businessId = req.params.businessId;
  const patch = req.body && typeof req.body === "object" ? req.body : {};

  const biz = (await query("SELECT config FROM businesses WHERE id = $1", [businessId])).rows[0];
  if (!biz) return res.status(404).json({ error: "Negócio não encontrado." });
  const current = biz.config || {};
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    next[key] = value && typeof value === "object" && !Array.isArray(value) && typeof current[key] === "object" ? { ...current[key], ...value } : value;
  }

  await query("UPDATE businesses SET config = $1::jsonb WHERE id = $2", [JSON.stringify(next), businessId]);
  res.json({ store: await buildStore(businessId) });
});
