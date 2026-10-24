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

configRouter.patch("/loyalty", requirePermission("gerirConfig"), async (req, res) => {
  const businessId = req.params.businessId;
  const { enabled, pointsPerMt, mtPerPoint } = req.body || {};
  await query(
    "UPDATE businesses SET loyalty_enabled = $1, loyalty_points_per_mt = $2, loyalty_mt_per_point = $3 WHERE id = $4",
    [!!enabled, Number(pointsPerMt) || 1, Number(mtPerPoint) || 0.1, businessId]
  );
  res.json({ store: await buildStore(businessId) });
});

configRouter.patch("/theme", requirePermission("gerirConfig"), async (req, res) => {
  const businessId = req.params.businessId;
  const { themeColor, logoUrl } = req.body || {};
  const sets = [];
  const vals = [];
  let i = 1;
  if (themeColor !== undefined) { sets.push(`theme_color = $${i++}`); vals.push(themeColor); }
  if (logoUrl !== undefined) { sets.push(`logo_url = $${i++}`); vals.push(logoUrl); }
  if (!sets.length) return res.status(400).json({ error: "Nada para atualizar." });
  vals.push(businessId);
  await query(`UPDATE businesses SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  res.json({ store: await buildStore(businessId) });
});

configRouter.post("/onboarding-done", requirePermission("gerirConfig"), async (req, res) => {
  const businessId = req.params.businessId;
  await query("UPDATE businesses SET onboarding_done = true WHERE id = $1", [businessId]);
  res.json({ store: await buildStore(businessId) });
});

configRouter.get("/backup", requirePermission("gerirConfig"), async (req, res) => {
  const businessId = req.params.businessId;
  const store = await buildStore(businessId);
  if (!store) return res.status(404).json({ error: "Negócio não encontrado." });
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    businessId,
    businessName: store.name,
    data: {
      config: store.config,
      products: store.products,
      categories: store.categories,
      clients: store.clients,
      employees: store.employees.map(({ permissions, ...e }) => e),
      suppliers: store.suppliers,
      sales: store.sales,
      contasPagar: store.contasPagar,
    },
  };
  res.set("Content-Disposition", `attachment; filename="backup-${store.slug || businessId}-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(backup);
});
