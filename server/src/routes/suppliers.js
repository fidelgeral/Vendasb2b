import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";

export const suppliersRouter = Router({ mergeParams: true });
suppliersRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

const supplierSchema = z.object({
  name: z.string().min(1),
  contacto: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  nuit: z.string().optional().default(""),
  endereco: z.string().optional().default(""),
  prazo: z.string().optional().default(""),
});

suppliersRouter.post("/suppliers", async (req, res) => {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados do fornecedor inválidos." });
  const f = parsed.data;
  const businessId = req.params.businessId;
  await query(
    "INSERT INTO suppliers (business_id, name, contacto, phone, email, nuit, endereco, prazo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    [businessId, f.name, f.contacto, f.phone, f.email, f.nuit, f.endereco, f.prazo]
  );
  await respond(res, businessId, 201);
});

suppliersRouter.delete("/suppliers/:id", async (req, res) => {
  const { businessId, id } = req.params;
  await query("DELETE FROM suppliers WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});

const purchaseSchema = z.object({
  supplierId: z.string().uuid(),
  productId: z.string().uuid(),
  qty: z.number().positive(),
  cost: z.number().min(0),
  expiryDate: z.string().optional().nullable(),
});

suppliersRouter.post("/purchases", async (req, res) => {
  const parsed = purchaseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados da compra inválidos." });
  const { supplierId, productId, qty, cost, expiryDate } = parsed.data;
  const businessId = req.params.businessId;

  const product = (await query("SELECT * FROM products WHERE id = $1 AND business_id = $2", [productId, businessId])).rows[0];
  if (!product) return res.status(404).json({ error: "Produto não encontrado." });

  const hasBatches = (await query("SELECT 1 FROM product_batches WHERE product_id = $1 LIMIT 1", [productId])).rows.length > 0;
  const hasVariants = (await query("SELECT 1 FROM product_variants WHERE product_id = $1 LIMIT 1", [productId])).rows.length > 0;
  const finalCost = cost || Number(product.cost);

  if (hasBatches || (!hasVariants && expiryDate)) {
    await query("INSERT INTO product_batches (product_id, qty, expiry_date) VALUES ($1,$2,$3)", [productId, qty, expiryDate]);
    await query("UPDATE products SET cost = $1 WHERE id = $2", [finalCost, productId]);
  } else if (!hasVariants) {
    await query("UPDATE products SET cost = $1, stock = stock + $2 WHERE id = $3", [finalCost, qty, productId]);
  }

  await query("INSERT INTO purchases (business_id, supplier_id, product_id, qty, cost, total) VALUES ($1,$2,$3,$4,$5,$6)", [
    businessId, supplierId, productId, qty, finalCost, finalCost * qty,
  ]);

  await respond(res, businessId, 201);
});
