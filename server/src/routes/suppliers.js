import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";
import { logAudit, authEmployee } from "../audit.js";

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
  const novo = (
    await query(
      "INSERT INTO suppliers (business_id, name, contacto, phone, email, nuit, endereco, prazo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      [businessId, f.name, f.contacto, f.phone, f.email, f.nuit, f.endereco, f.prazo]
    )
  ).rows[0];
  await logAudit({ businessId, employee: authEmployee(req), acao: "FORNECEDOR", detalhe: `Criou o fornecedor "${f.name}"`, entityType: "fornecedor", entityId: novo.id });
  await respond(res, businessId, 201);
});

suppliersRouter.patch("/suppliers/:id", async (req, res) => {
  const parsed = supplierSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados do fornecedor inválidos." });
  const { businessId, id } = req.params;
  const antes = (await query("SELECT * FROM suppliers WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (!antes) return res.status(404).json({ error: "Fornecedor não encontrado." });
  const f = { ...antes, ...parsed.data };
  await query(
    "UPDATE suppliers SET name=$1, contacto=$2, phone=$3, email=$4, nuit=$5, endereco=$6, prazo=$7 WHERE id=$8 AND business_id=$9",
    [f.name, f.contacto || "", f.phone || "", f.email || "", f.nuit || "", f.endereco || "", f.prazo || "", id, businessId]
  );
  const mudancas = ["name", "contacto", "phone", "email", "nuit", "endereco", "prazo"]
    .filter((k) => parsed.data[k] !== undefined && String(parsed.data[k] || "") !== String(antes[k] || ""))
    .map((k) => `${k}: "${antes[k] || ""}" → "${parsed.data[k] || ""}"`)
    .join("; ");
  await logAudit({ businessId, employee: authEmployee(req), acao: "FORNECEDOR", detalhe: `Editou o fornecedor "${f.name}"${mudancas ? ` (${mudancas})` : ""}`, entityType: "fornecedor", entityId: id });
  await respond(res, businessId);
});

suppliersRouter.delete("/suppliers/:id", async (req, res) => {
  const { businessId, id } = req.params;
  const antes = (await query("SELECT name FROM suppliers WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  await query("DELETE FROM suppliers WHERE id = $1 AND business_id = $2", [id, businessId]);
  if (antes) await logAudit({ businessId, employee: authEmployee(req), acao: "FORNECEDOR", detalhe: `Apagou o fornecedor "${antes.name}"`, entityType: "fornecedor", entityId: id });
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
