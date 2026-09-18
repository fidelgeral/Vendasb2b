import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";

export const tablesRouter = Router({ mergeParams: true });
tablesRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

tablesRouter.post("/tables", async (req, res) => {
  const businessId = req.params.businessId;
  const count = Number((await query("SELECT count(*) FROM tables WHERE business_id = $1", [businessId])).rows[0].count);
  const label = req.body?.label || `Mesa ${count + 1}`;
  await query("INSERT INTO tables (business_id, label, seats) VALUES ($1,$2,4)", [businessId, label]);
  await respond(res, businessId, 201);
});

tablesRouter.patch("/tables/:id", async (req, res) => {
  const label = String(req.body?.label || "").trim();
  if (!label) return res.status(400).json({ error: "Indique um nome para a mesa." });
  const { businessId, id } = req.params;
  await query("UPDATE tables SET label = $1 WHERE id = $2 AND business_id = $3", [label, id, businessId]);
  await respond(res, businessId);
});

tablesRouter.delete("/tables/:id", async (req, res) => {
  const { businessId, id } = req.params;
  const occupied = (await query("SELECT 1 FROM comandas WHERE table_id = $1", [id])).rows.length > 0;
  if (occupied) return res.status(409).json({ error: "Mesa ocupada, não pode ser removida." });
  await query("DELETE FROM tables WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});

const comandaItemSchema = z.object({ productId: z.string().uuid(), name: z.string(), price: z.number(), cost: z.number(), qty: z.number() });

tablesRouter.post("/tables/:tableId/comanda/open", async (req, res) => {
  const { businessId, tableId } = req.params;
  const existing = (await query("SELECT id FROM comandas WHERE table_id = $1", [tableId])).rows[0];
  if (!existing) {
    await query("INSERT INTO comandas (business_id, table_id, items, service_charge_pct) VALUES ($1,$2,'[]'::jsonb,10)", [businessId, tableId]);
  }
  await respond(res, businessId, 201);
});

tablesRouter.put("/tables/:tableId/comanda/items", async (req, res) => {
  const parsed = z.array(comandaItemSchema).safeParse(req.body?.items);
  if (!parsed.success) return res.status(400).json({ error: "Itens inválidos." });
  const { businessId, tableId } = req.params;
  await query("UPDATE comandas SET items = $1::jsonb WHERE table_id = $2 AND business_id = $3", [
    JSON.stringify(parsed.data), tableId, businessId,
  ]);
  await respond(res, businessId);
});

tablesRouter.delete("/tables/:tableId/comanda", async (req, res) => {
  const { businessId, tableId } = req.params;
  await query("DELETE FROM comandas WHERE table_id = $1 AND business_id = $2", [tableId, businessId]);
  await respond(res, businessId);
});
