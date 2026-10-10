import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness, requireRole } from "../auth/middleware.js";
import { buildStore } from "./store.js";

export const lotesRouter = Router({ mergeParams: true });
lotesRouter.use(requireAuth, requireBusiness);

// Apanha erros de handlers async e encaminha-os para o tratador de erros
// (o Express 4 não o faz sozinho — sem isto um erro deitava o processo abaixo).
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });
const empName = (req) => (req.auth.type === "employee" ? req.auth.name : "Super-admin");
const httpErr = (status, message) => Object.assign(new Error(message), { http: status });

// Regista um movimento no histórico do lote.
async function logMov(client, { businessId, batchId, productId, tipo, qty, saldo, descricao, employeeName }) {
  await client.query(
    `INSERT INTO batch_movements (business_id, batch_id, product_id, tipo, qty, saldo, descricao, employee_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [businessId, batchId, productId, tipo, qty, saldo, descricao || null, employeeName || null]
  );
}

async function getProduct(client, productId, businessId) {
  return (await client.query("SELECT * FROM products WHERE id = $1 AND business_id = $2", [productId, businessId])).rows[0];
}

async function getLote(client, loteId, businessId) {
  return (
    await client.query(
      "SELECT b.* FROM product_batches b JOIN products p ON p.id = b.product_id WHERE b.id = $1 AND p.business_id = $2",
      [loteId, businessId]
    )
  ).rows[0];
}

// Se o produto ainda usa o stock simples (products.stock) e não tem lotes,
// converte esse stock num lote inicial para não se perder quantidade quando se
// passa a gerir por lotes.
async function ensureLoteMode(client, product, businessId, employeeName) {
  const temLote = (await client.query("SELECT 1 FROM product_batches WHERE product_id = $1 LIMIT 1", [product.id])).rows[0];
  if (temLote) return;
  const stock = Number(product.stock) || 0;
  if (stock <= 0) return;
  const custoTotal = stock * (Number(product.cost) || 0);
  const row = (
    await client.query(
      `INSERT INTO product_batches (product_id, name, qty, initial_qty, cost_total, expiry_date)
       VALUES ($1,$2,$3,$3,$4,NULL) RETURNING id`,
      [product.id, `${product.name} -L000`, stock, custoTotal]
    )
  ).rows[0];
  await client.query("UPDATE products SET stock = 0 WHERE id = $1", [product.id]);
  await logMov(client, { businessId, batchId: row.id, productId: product.id, tipo: "entrada", qty: stock, saldo: stock, descricao: "Stock inicial convertido em lote", employeeName });
}

const loteSchema = z.object({
  productId: z.string().uuid(),
  name: z.string().optional().nullable(),
  qty: z.number().min(0),
  costTotal: z.number().min(0).optional().default(0),
  expiryDate: z.string().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
});

// Criar um lote individual.
lotesRouter.post(
  "/lotes",
  wrap(async (req, res) => {
    const parsed = loteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados do lote inválidos.", details: parsed.error.flatten() });
    const f = parsed.data;
    const businessId = req.params.businessId;
    await withTransaction(async (client) => {
      const product = await getProduct(client, f.productId, businessId);
      if (!product) throw httpErr(404, "Produto não encontrado.");
      await ensureLoteMode(client, product, businessId, empName(req));
      const nome = (f.name && f.name.trim()) || `${product.name} -L${String(Date.now()).slice(-4)}`;
      const row = (
        await client.query(
          `INSERT INTO product_batches (product_id, name, qty, initial_qty, cost_total, supplier_id, expiry_date)
           VALUES ($1,$2,$3,$3,$4,$5,$6) RETURNING id`,
          [product.id, nome, f.qty, f.costTotal, f.supplierId || null, f.expiryDate || null]
        )
      ).rows[0];
      await logMov(client, { businessId, batchId: row.id, productId: product.id, tipo: "entrada", qty: f.qty, saldo: f.qty, descricao: "Criação do lote", employeeName: empName(req) });
    });
    return respond(res, businessId, 201);
  })
);

// Criar vários lotes de uma vez (por fornecedor).
const bulkSchema = z.object({
  supplierId: z.string().uuid().optional().nullable(),
  lotes: z.array(loteSchema.partial({ supplierId: true })).min(1),
});
lotesRouter.post(
  "/lotes/bulk",
  wrap(async (req, res) => {
    const parsed = bulkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Dados inválidos.", details: parsed.error.flatten() });
    const { supplierId, lotes } = parsed.data;
    const businessId = req.params.businessId;
    await withTransaction(async (client) => {
      for (const l of lotes) {
        // eslint-disable-next-line no-await-in-loop
        const product = await getProduct(client, l.productId, businessId);
        if (!product) continue;
        // eslint-disable-next-line no-await-in-loop
        await ensureLoteMode(client, product, businessId, empName(req));
        const nome = (l.name && l.name.trim()) || `${product.name} -L${String(Date.now()).slice(-4)}`;
        // eslint-disable-next-line no-await-in-loop
        const row = (
          await client.query(
            `INSERT INTO product_batches (product_id, name, qty, initial_qty, cost_total, supplier_id, expiry_date)
             VALUES ($1,$2,$3,$3,$4,$5,$6) RETURNING id`,
            [product.id, nome, l.qty, l.costTotal || 0, l.supplierId || supplierId || null, l.expiryDate || null]
          )
        ).rows[0];
        // eslint-disable-next-line no-await-in-loop
        await logMov(client, { businessId, batchId: row.id, productId: product.id, tipo: "entrada", qty: l.qty, saldo: l.qty, descricao: "Entrada por fornecedor", employeeName: empName(req) });
      }
    });
    return respond(res, businessId, 201);
  })
);

// Entrada: adicionar quantidade a um lote existente.
lotesRouter.post(
  "/lotes/:id/entrada",
  wrap(async (req, res) => {
    const businessId = req.params.businessId;
    const qty = Number(req.body?.qty);
    if (!qty || qty <= 0) return res.status(400).json({ error: "Quantidade inválida." });
    await withTransaction(async (client) => {
      const lote = await getLote(client, req.params.id, businessId);
      if (!lote) throw httpErr(404, "Lote não encontrado.");
      const unit = Number(lote.initial_qty) > 0 ? Number(lote.cost_total) / Number(lote.initial_qty) : 0;
      const novoSaldo = Number(lote.qty) + qty;
      await client.query(
        "UPDATE product_batches SET qty = $1, initial_qty = initial_qty + $2, cost_total = cost_total + $3 WHERE id = $4",
        [novoSaldo, qty, qty * unit, lote.id]
      );
      await logMov(client, { businessId, batchId: lote.id, productId: lote.product_id, tipo: "entrada", qty, saldo: novoSaldo, descricao: req.body?.descricao || "Entrada de stock", employeeName: empName(req) });
    });
    return respond(res, businessId);
  })
);

// Editar um lote (nome, validade, custo, fornecedor, quantidade com motivo).
lotesRouter.patch(
  "/lotes/:id",
  requireRole("dono", "gerente"),
  wrap(async (req, res) => {
    const businessId = req.params.businessId;
    const b = req.body || {};
    await withTransaction(async (client) => {
      const lote = await getLote(client, req.params.id, businessId);
      if (!lote) throw httpErr(404, "Lote não encontrado.");
      const name = b.name != null ? String(b.name) : lote.name;
      const expiry = b.expiryDate !== undefined ? b.expiryDate || null : lote.expiry_date;
      const costTotal = b.costTotal != null ? Number(b.costTotal) : Number(lote.cost_total);
      const supplierId = b.supplierId !== undefined ? b.supplierId || null : lote.supplier_id;
      const novaQty = b.qty != null ? Number(b.qty) : Number(lote.qty);
      await client.query(
        "UPDATE product_batches SET name = $1, expiry_date = $2, cost_total = $3, supplier_id = $4, qty = $5 WHERE id = $6",
        [name, expiry, costTotal, supplierId, novaQty, lote.id]
      );
      if (novaQty !== Number(lote.qty)) {
        await logMov(client, { businessId, batchId: lote.id, productId: lote.product_id, tipo: "ajuste", qty: novaQty - Number(lote.qty), saldo: novaQty, descricao: b.motivo || "Edição do lote", employeeName: empName(req) });
      }
    });
    return respond(res, businessId);
  })
);

// Quebra num lote específico.
lotesRouter.post(
  "/lotes/:id/quebra",
  wrap(async (req, res) => {
    const businessId = req.params.businessId;
    const qty = Number(req.body?.qty);
    const motivo = req.body?.motivo || "Quebra";
    if (!qty || qty <= 0) return res.status(400).json({ error: "Quantidade inválida." });
    await withTransaction(async (client) => {
      const lote = await getLote(client, req.params.id, businessId);
      if (!lote) throw httpErr(404, "Lote não encontrado.");
      const retirar = Math.min(qty, Number(lote.qty));
      const novoSaldo = Number(lote.qty) - retirar;
      const unit = Number(lote.initial_qty) > 0 ? Number(lote.cost_total) / Number(lote.initial_qty) : 0;
      const shift = (await client.query("SELECT id FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];
      await client.query("UPDATE product_batches SET qty = $1 WHERE id = $2", [novoSaldo, lote.id]);
      await client.query(
        "INSERT INTO quebras (business_id, product_id, variant_id, qty, motivo, custo_impacto, shift_id) VALUES ($1,$2,NULL,$3,$4,$5,$6)",
        [businessId, lote.product_id, retirar, motivo, retirar * unit, shift ? shift.id : null]
      );
      await logMov(client, { businessId, batchId: lote.id, productId: lote.product_id, tipo: "quebra", qty: -retirar, saldo: novoSaldo, descricao: motivo, employeeName: empName(req) });
    });
    return respond(res, businessId);
  })
);

// Apagar um lote.
lotesRouter.delete(
  "/lotes/:id",
  requireRole("dono", "gerente"),
  wrap(async (req, res) => {
    const businessId = req.params.businessId;
    const lote = await getLote({ query: (t, p) => query(t, p) }, req.params.id, businessId);
    if (!lote) return res.status(404).json({ error: "Lote não encontrado." });
    await query("DELETE FROM product_batches WHERE id = $1", [req.params.id]);
    return respond(res, businessId);
  })
);

// Histórico de movimentos de um lote.
lotesRouter.get(
  "/lotes/:id/historico",
  wrap(async (req, res) => {
    const businessId = req.params.businessId;
    const lote = await getLote({ query: (t, p) => query(t, p) }, req.params.id, businessId);
    if (!lote) return res.status(404).json({ error: "Lote não encontrado." });
    const movimentos = (
      await query(
        `SELECT id, tipo, qty, saldo, descricao, employee_name AS "employeeName", created_at AS "createdAt"
         FROM batch_movements WHERE batch_id = $1 ORDER BY created_at DESC`,
        [req.params.id]
      )
    ).rows;
    res.json({ movimentos });
  })
);

// Tratador de erros desta rota.
// eslint-disable-next-line no-unused-vars
lotesRouter.use((err, req, res, next) => {
  if (err && err.http) return res.status(err.http).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Erro ao processar o lote." });
});
