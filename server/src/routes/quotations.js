import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStoreAndCache } from "./store.js";
import { requirePermission } from "../permissions.js";

export const quotationsRouter = Router({ mergeParams: true });
quotationsRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStoreAndCache(businessId) });

const itemSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  variantId: z.string().uuid().optional().nullable(),
  name: z.string(),
  qty: z.number().positive(),
  price: z.number().min(0),
  cost: z.number().min(0).optional().default(0),
});

const quotationSchema = z.object({
  items: z.array(itemSchema).min(1),
  total: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  ivaTaxa: z.number().min(0).optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
});

// Numeração simples não-fiscal: COT<ano>/<sequencial>
async function nextCotacaoNumber(businessId) {
  const ano = new Date().getFullYear();
  const n = (await query("SELECT COUNT(*)::int AS c FROM quotations WHERE business_id = $1 AND date_part('year', created_at) = $2", [businessId, ano])).rows[0].c;
  return "COT" + ano + "/" + String(n + 1).padStart(4, "0");
}

quotationsRouter.post("/quotations", requirePermission("cotacao"), async (req, res) => {
  const parsed = quotationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados da cotação inválidos.", details: parsed.error.flatten() });
  const f = parsed.data;
  const businessId = req.params.businessId;
  const numero = await nextCotacaoNumber(businessId);
  await query(
    "INSERT INTO quotations (business_id, numero, client_id, items, total, discount, iva_taxa) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
    [businessId, numero, f.clientId || null, JSON.stringify(f.items), f.total, f.discount, f.ivaTaxa == null ? null : f.ivaTaxa]
  );
  await respond(res, businessId, 201);
});

quotationsRouter.delete("/quotations/:id", requirePermission("cotacao"), async (req, res) => {
  const { businessId, id } = req.params;
  await query("DELETE FROM quotations WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});
