import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";

export const productsRouter = Router({ mergeParams: true });
productsRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

const productSchema = z.object({
  tipo: z.enum(["simples", "variacao", "composicao"]).default("simples"),
  vendaDirecta: z.boolean().default(true),
  name: z.string().min(1),
  codigo: z.string().optional().default(""),
  category: z.string().optional().default("Geral"),
  unit: z.string().optional().default("un"),
  qtdItens: z.number().optional().default(1),
  ivaTaxa: z.number().nullable().optional().default(null),
  price: z.number().min(0).default(0),
  cost: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  prazoReembolso: z.number().optional().default(0),
  foto: z.string().optional().default(""),
  parentId: z.string().uuid().optional().nullable(),
  consumo: z.number().optional().default(1),
  ingredientes: z.array(z.object({ productId: z.string().uuid(), qty: z.number() })).optional().default([]),
  fornecedorId: z.string().uuid().optional().nullable(),
  addEstoque: z.boolean().optional().default(false),
  estoqueQtd: z.number().optional().default(0),
  estoqueValidade: z.string().optional().nullable(),
});

productsRouter.post("/products", async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados do produto inválidos.", details: parsed.error.flatten() });
  const f = parsed.data;
  const businessId = req.params.businessId;

  if (f.tipo === "variacao" && !f.parentId) return res.status(400).json({ error: "Escolha o produto-pai." });
  if (f.tipo === "composicao" && f.ingredientes.length === 0) return res.status(400).json({ error: "Adicione ao menos um ingrediente." });

  await withTransaction(async (client) => {
    let cost = f.cost;
    if (f.tipo === "composicao" && !cost) {
      const ids = f.ingredientes.map((i) => i.productId);
      const rows = ids.length ? (await client.query("SELECT id, cost FROM products WHERE id = ANY($1::uuid[])", [ids])).rows : [];
      const costs = Object.fromEntries(rows.map((r) => [r.id, Number(r.cost)]));
      cost = f.ingredientes.reduce((a, ing) => a + (costs[ing.productId] || 0) * ing.qty, 0);
    }

    const stockValue = f.tipo === "simples" && !f.addEstoque ? 0 : f.tipo === "simples" && f.addEstoque && !f.estoqueValidade ? f.estoqueQtd : 0;

    const product = (
      await client.query(
        `INSERT INTO products (business_id, tipo, venda_directa, codigo, name, category, unit, qtd_itens, iva_taxa, price, cost, min_stock, prazo_reembolso, foto, stock, parent_id, consumo, fornecedor_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING id`,
        [
          businessId, f.tipo, f.vendaDirecta, f.codigo, f.name, f.category, f.unit, f.qtdItens, f.ivaTaxa, f.price, cost,
          f.minStock, f.prazoReembolso, f.foto, stockValue, f.tipo === "variacao" ? f.parentId : null, f.consumo,
          f.fornecedorId || null,
        ]
      )
    ).rows[0];

    if (f.tipo === "composicao") {
      for (const ing of f.ingredientes) {
        // eslint-disable-next-line no-await-in-loop
        await client.query("INSERT INTO product_combo_items (product_id, ingredient_product_id, qty) VALUES ($1,$2,$3)", [
          product.id, ing.productId, ing.qty,
        ]);
      }
    }
    if (f.tipo === "simples" && f.addEstoque && f.estoqueValidade && f.estoqueQtd > 0) {
      await client.query("INSERT INTO product_batches (product_id, qty, expiry_date) VALUES ($1,$2,$3)", [product.id, f.estoqueQtd, f.estoqueValidade]);
    }
    if (f.tipo === "simples" && f.addEstoque && f.estoqueQtd > 0) {
      await client.query("INSERT INTO purchases (business_id, supplier_id, product_id, qty, cost, total) VALUES ($1,$2,$3,$4,$5,$6)", [
        businessId, f.fornecedorId || null, product.id, f.estoqueQtd, cost, cost * f.estoqueQtd,
      ]);
    }
  });

  await respond(res, businessId, 201);
});

// Para o PATCH, todos os campos são genuinamente opcionais e SEM valor por
// omissão — um campo ausente tem de ficar `undefined` (e não ser preenchido
// com um default do zod), para o handler conseguir preservar o valor actual.
const updateSchema = z.object({
  tipo: z.enum(["simples", "variacao", "composicao"]).optional(),
  vendaDirecta: z.boolean().optional(),
  name: z.string().min(1).optional(),
  codigo: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
  qtdItens: z.number().optional(),
  ivaTaxa: z.number().nullable().optional(),
  price: z.number().min(0).optional(),
  cost: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  prazoReembolso: z.number().optional(),
  foto: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
  consumo: z.number().optional(),
  ingredientes: z.array(z.object({ productId: z.string().uuid(), qty: z.number() })).optional(),
  fornecedorId: z.string().uuid().nullable().optional(),
  active: z.boolean().optional(),
});

productsRouter.patch("/products/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos.", details: parsed.error.flatten() });
  const f = parsed.data;
  const { businessId, id } = req.params;

  const existing = (await query("SELECT * FROM products WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (!existing) return res.status(404).json({ error: "Produto não encontrado." });

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE products SET tipo=$1, venda_directa=$2, codigo=$3, name=$4, category=$5, unit=$6, qtd_itens=$7, iva_taxa=$8,
       price=$9, cost=$10, min_stock=$11, prazo_reembolso=$12, foto=$13, parent_id=$14, consumo=$15, fornecedor_id=$16,
       active = COALESCE($17, active)
       WHERE id = $18`,
      [
        f.tipo ?? existing.tipo, f.vendaDirecta ?? existing.venda_directa, f.codigo ?? existing.codigo, f.name ?? existing.name,
        f.category ?? existing.category, f.unit ?? existing.unit, f.qtdItens ?? existing.qtd_itens, f.ivaTaxa ?? existing.iva_taxa,
        f.price ?? existing.price, f.cost ?? existing.cost, f.minStock ?? existing.min_stock, f.prazoReembolso ?? existing.prazo_reembolso,
        f.foto ?? existing.foto, (f.tipo ?? existing.tipo) === "variacao" ? f.parentId ?? existing.parent_id : null,
        f.consumo ?? existing.consumo, f.fornecedorId ?? existing.fornecedor_id, f.active ?? null, id,
      ]
    );
    if (f.ingredientes) {
      await client.query("DELETE FROM product_combo_items WHERE product_id = $1", [id]);
      for (const ing of f.ingredientes) {
        // eslint-disable-next-line no-await-in-loop
        await client.query("INSERT INTO product_combo_items (product_id, ingredient_product_id, qty) VALUES ($1,$2,$3)", [id, ing.productId, ing.qty]);
      }
    }
  });

  await respond(res, businessId);
});

productsRouter.delete("/products/:id", async (req, res) => {
  const { businessId, id } = req.params;
  const dependents = (
    await query(
      "SELECT 1 FROM products WHERE business_id = $1 AND parent_id = $2 UNION SELECT 1 FROM product_combo_items ci JOIN products p ON p.id = ci.product_id WHERE p.business_id = $1 AND ci.ingredient_product_id = $2",
      [businessId, id]
    )
  ).rows;
  if (dependents.length) return res.status(409).json({ error: "Não é possível apagar: outro produto depende deste." });
  await query("DELETE FROM products WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});

productsRouter.post("/products/:id/stock-adjust", async (req, res) => {
  const delta = Number(req.body?.delta);
  if (!Number.isFinite(delta)) return res.status(400).json({ error: "Quantidade inválida." });
  const { businessId, id } = req.params;
  await query(
    "UPDATE products SET stock = GREATEST(0, stock + $1) WHERE id = $2 AND business_id = $3 AND NOT EXISTS (SELECT 1 FROM product_variants WHERE product_id = $2) AND NOT EXISTS (SELECT 1 FROM product_batches WHERE product_id = $2)",
    [delta, id, businessId]
  );
  await respond(res, businessId);
});

productsRouter.post("/products/:id/variants", async (req, res) => {
  const label = String(req.body?.label || "").trim();
  if (!label) return res.status(400).json({ error: "Indique um nome para a variação." });
  const { businessId, id } = req.params;
  await query("INSERT INTO product_variants (product_id, label, stock) SELECT id, $1, 0 FROM products WHERE id = $2 AND business_id = $3", [
    label, id, businessId,
  ]);
  await respond(res, businessId, 201);
});

productsRouter.post("/products/:id/variants/:variantId/adjust", async (req, res) => {
  const delta = Number(req.body?.delta);
  if (!Number.isFinite(delta)) return res.status(400).json({ error: "Quantidade inválida." });
  const { businessId, id, variantId } = req.params;
  await query(
    "UPDATE product_variants v SET stock = GREATEST(0, v.stock + $1) FROM products p WHERE v.id = $2 AND v.product_id = p.id AND p.id = $3 AND p.business_id = $4",
    [delta, variantId, id, businessId]
  );
  await respond(res, businessId);
});

productsRouter.post("/products/:id/batches", async (req, res) => {
  const qty = Number(req.body?.qty);
  const expiryDate = req.body?.expiryDate || null;
  if (!Number.isFinite(qty)) return res.status(400).json({ error: "Quantidade inválida." });
  const { businessId, id } = req.params;
  await query("INSERT INTO product_batches (product_id, qty, expiry_date) SELECT id, $1, $2 FROM products WHERE id = $3 AND business_id = $4", [
    qty, expiryDate, id, businessId,
  ]);
  await respond(res, businessId, 201);
});

const bulkRowSchema = z.object({
  name: z.string(),
  category: z.string().optional(),
  unit: z.string().optional(),
  price: z.union([z.number(), z.string()]).optional(),
  cost: z.union([z.number(), z.string()]).optional(),
  stock: z.union([z.number(), z.string()]).optional(),
  minStock: z.union([z.number(), z.string()]).optional(),
});

productsRouter.post("/products/bulk-import", async (req, res) => {
  const parsed = z.array(bulkRowSchema).safeParse(req.body?.rows);
  if (!parsed.success) return res.status(400).json({ error: "Ficheiro inválido." });
  const businessId = req.params.businessId;
  let created = 0;
  let updated = 0;
  let skipped = 0;

  await withTransaction(async (client) => {
    for (const row of parsed.data) {
      if (!row.name) continue;
      // eslint-disable-next-line no-await-in-loop
      const existing = (
        await client.query("SELECT id FROM products WHERE business_id = $1 AND lower(name) = lower($2)", [businessId, row.name])
      ).rows[0];
      if (existing) {
        // eslint-disable-next-line no-await-in-loop
        const hasVariantsOrBatches = (
          await client.query(
            "SELECT (SELECT count(*) FROM product_variants WHERE product_id = $1) + (SELECT count(*) FROM product_batches WHERE product_id = $1) AS n",
            [existing.id]
          )
        ).rows[0].n;
        if (Number(hasVariantsOrBatches) > 0) {
          skipped++;
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        await client.query(
          "UPDATE products SET price = COALESCE(NULLIF($1,0), price), cost = COALESCE(NULLIF($2,0), cost), stock = stock + $3 WHERE id = $4",
          [Number(row.price) || 0, Number(row.cost) || 0, Number(row.stock) || 0, existing.id]
        );
        updated++;
      } else {
        // eslint-disable-next-line no-await-in-loop
        await client.query(
          "INSERT INTO products (business_id, name, category, unit, price, cost, stock, min_stock) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [businessId, row.name, row.category || "Geral", row.unit || "un", Number(row.price) || 0, Number(row.cost) || 0, Number(row.stock) || 0, Number(row.minStock) || 0]
        );
        created++;
      }
    }
  });

  const store = await buildStore(businessId);
  res.json({ store, summary: { created, updated, skipped } });
});

productsRouter.post("/categories", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Indique um nome de categoria." });
  const businessId = req.params.businessId;
  await query("INSERT INTO categories (business_id, name) VALUES ($1,$2) ON CONFLICT DO NOTHING", [businessId, name]);
  await respond(res, businessId, 201);
});

productsRouter.delete("/categories/:name", async (req, res) => {
  const businessId = req.params.businessId;
  await query("DELETE FROM categories WHERE business_id = $1 AND name = $2", [businessId, req.params.name]);
  await respond(res, businessId);
});
