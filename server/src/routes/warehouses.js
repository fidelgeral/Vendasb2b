import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStoreAndCache } from "./store.js";

export const warehousesRouter = Router({ mergeParams: true });
warehousesRouter.use(requireAuth, requireBusiness);

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const respond = async (res, businessId) => res.json({ store: await buildStoreAndCache(businessId) });

const whSchema = z.object({
  name: z.string().min(1),
  tipo: z.enum(["principal", "interno"]).default("interno"),
  descricao: z.string().optional().nullable(),
});

warehousesRouter.post(
  "/warehouses",
  wrap(async (req, res) => {
    const parsed = whSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
    const { name, tipo, descricao } = parsed.data;
    const bid = req.params.businessId;
    await query(
      "INSERT INTO warehouses (business_id, name, tipo, descricao) VALUES ($1,$2,$3,$4)",
      [bid, name, tipo, descricao || null]
    );
    await respond(res, bid);
  })
);

warehousesRouter.put(
  "/warehouses/:whId",
  wrap(async (req, res) => {
    const parsed = whSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
    const { name, tipo, descricao } = parsed.data;
    await query(
      "UPDATE warehouses SET name=$1, tipo=$2, descricao=$3 WHERE id=$4 AND business_id=$5",
      [name, tipo, descricao || null, req.params.whId, req.params.businessId]
    );
    await respond(res, req.params.businessId);
  })
);

warehousesRouter.delete(
  "/warehouses/:whId",
  wrap(async (req, res) => {
    const bid = req.params.businessId;
    await withTransaction(async (client) => {
      await client.query("UPDATE product_batches SET warehouse_id = NULL WHERE warehouse_id = $1", [req.params.whId]);
      await client.query("DELETE FROM warehouses WHERE id = $1 AND business_id = $2", [req.params.whId, bid]);
    });
    await respond(res, bid);
  })
);

warehousesRouter.post(
  "/warehouses/transfer",
  wrap(async (req, res) => {
    const schema = z.object({
      batchId: z.string().uuid(),
      fromWarehouseId: z.string().uuid().nullable(),
      toWarehouseId: z.string().uuid(),
      qty: z.number().positive(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
    const { batchId, fromWarehouseId, toWarehouseId, qty } = parsed.data;
    const bid = req.params.businessId;
    const empName = req.auth.type === "employee" ? req.auth.name : "Super-admin";

    await withTransaction(async (client) => {
      const batch = (await client.query(
        "SELECT b.* FROM product_batches b JOIN products p ON p.id = b.product_id WHERE b.id = $1 AND p.business_id = $2 FOR UPDATE OF b",
        [batchId, bid]
      )).rows[0];
      if (!batch) throw Object.assign(new Error("Lote não encontrado."), { http: 404 });
      if (Number(batch.qty) < qty) throw Object.assign(new Error("Quantidade insuficiente."), { http: 400 });

      const newQty = Number(batch.qty) - qty;
      await client.query("UPDATE product_batches SET qty = $1, warehouse_id = $2 WHERE id = $3", [newQty, fromWarehouseId, batchId]);

      await client.query(
        `INSERT INTO product_batches (product_id, name, qty, initial_qty, cost_total, expiry_date, supplier_id, warehouse_id)
         SELECT product_id, name || ' (transf)', $2, $2, (cost_total / NULLIF(initial_qty,0)) * $2, expiry_date, supplier_id, $3
         FROM product_batches WHERE id = $1`,
        [batchId, qty, toWarehouseId]
      );

      await client.query(
        "INSERT INTO warehouse_transfers (business_id, from_warehouse_id, to_warehouse_id, batch_id, product_id, qty, employee_name) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [bid, fromWarehouseId, toWarehouseId, batchId, batch.product_id, qty, empName]
      );
    });
    await respond(res, bid);
  })
);

warehousesRouter.get(
  "/warehouses/transfers",
  wrap(async (req, res) => {
    const bid = req.params.businessId;
    const rows = (await query(
      `SELECT wt.*, p.name AS product_name,
              fw.name AS from_name, tw.name AS to_name
       FROM warehouse_transfers wt
       LEFT JOIN products p ON p.id = wt.product_id
       LEFT JOIN warehouses fw ON fw.id = wt.from_warehouse_id
       LEFT JOIN warehouses tw ON tw.id = wt.to_warehouse_id
       WHERE wt.business_id = $1 ORDER BY wt.created_at DESC LIMIT 200`,
      [bid]
    )).rows;
    res.json({ transfers: rows });
  })
);
