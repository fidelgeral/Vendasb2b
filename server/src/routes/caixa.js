import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";

export const caixaRouter = Router({ mergeParams: true });
caixaRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

caixaRouter.post("/shifts/open", async (req, res) => {
  const businessId = req.params.businessId;
  const openingCash = Number(req.body?.openingCash) || 0;
  const open = (await query("SELECT 1 FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows.length;
  if (open) return res.status(409).json({ error: "Já existe um turno aberto." });
  const employeeId = req.auth.type === "employee" ? req.auth.employeeId : null;
  await query("INSERT INTO shifts (business_id, opened_by, opening_cash) VALUES ($1,$2,$3)", [businessId, employeeId, openingCash]);
  await respond(res, businessId, 201);
});

caixaRouter.post("/shifts/close", async (req, res) => {
  const businessId = req.params.businessId;
  const closingCash = Number(req.body?.closingCash) || 0;
  const employeeId = req.auth.type === "employee" ? req.auth.employeeId : null;

  const shift = (await query("SELECT * FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];
  if (!shift) return res.status(409).json({ error: "Não há turno aberto." });

  const cashIn = (
    await query(
      `SELECT COALESCE(SUM((p->>'amount')::numeric), 0) AS total FROM sales s, jsonb_array_elements(s.payments) p
       WHERE s.shift_id = $1 AND s.voided = false AND p->>'method' = 'dinheiro'`,
      [shift.id]
    )
  ).rows[0].total;
  const movs = (
    await query(
      `SELECT COALESCE(SUM(amount) FILTER (WHERE tipo = 'entrada'), 0) AS entradas,
              COALESCE(SUM(amount) FILTER (WHERE tipo = 'saida'), 0) AS saidas
       FROM movimentos_caixa WHERE shift_id = $1`,
      [shift.id]
    )
  ).rows[0];

  const expected = Number(shift.opening_cash) + Number(cashIn) + Number(movs.entradas) - Number(movs.saidas);
  await query("UPDATE shifts SET closed_at = now(), closing_cash = $1, expected_cash = $2, closed_by = $3 WHERE id = $4", [
    closingCash, expected, employeeId, shift.id,
  ]);
  await respond(res, businessId);
});

const quebraSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  qty: z.number().positive(),
  motivo: z.string().optional().default(""),
});

caixaRouter.post("/quebras", async (req, res) => {
  const parsed = quebraSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { productId, variantId, qty, motivo } = parsed.data;
  const businessId = req.params.businessId;
  const employee = req.auth.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };

  const product = (await query("SELECT * FROM products WHERE id = $1 AND business_id = $2", [productId, businessId])).rows[0];
  if (!product) return res.status(404).json({ error: "Produto não encontrado." });
  const currentShift = (await query("SELECT id FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];
  const custoImpacto = Number(product.cost) * qty;

  await withTransaction(async (client) => {
    await decrementStock(client, productId, variantId, qty);
    await client.query(
      "INSERT INTO quebras (business_id, product_id, variant_id, qty, motivo, custo_impacto, shift_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [businessId, productId, variantId || null, qty, motivo, custoImpacto, currentShift ? currentShift.id : null]
    );
    await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
      businessId, employee.id, employee.name, "QUEBRA", `${product.name} × ${qty} — ${motivo}`, custoImpacto,
    ]);
  });

  await respond(res, businessId, 201);
});

const movimentoSchema = z.object({
  type: z.enum(["entrada", "saida"]),
  amount: z.number().positive(),
  motivo: z.string().optional().default(""),
  categoria: z.string().optional().default("Outros"),
});

caixaRouter.post("/movimentos", async (req, res) => {
  const parsed = movimentoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados inválidos." });
  const { type, amount, motivo, categoria } = parsed.data;
  const businessId = req.params.businessId;
  const employee = req.auth.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };

  const currentShift = (await query("SELECT id FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];
  if (!currentShift) return res.status(409).json({ error: "Abra o caixa primeiro." });

  await withTransaction(async (client) => {
    await client.query(
      "INSERT INTO movimentos_caixa (business_id, shift_id, tipo, categoria, amount, descricao, employee_id) VALUES ($1,$2,$3,$4,$5,$6,$7)",
      [businessId, currentShift.id, type, categoria, amount, motivo, employee.id]
    );
    await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
      businessId, employee.id, employee.name, type === "entrada" ? "ENTRADA CAIXA" : "SAÍDA CAIXA", `${categoria}${motivo ? " — " + motivo : ""}`, amount,
    ]);
  });

  await respond(res, businessId, 201);
});

// Aplica um decremento de stock respeitando variação/composição/lotes — usado por quebras e vendas.
export async function decrementStock(client, productId, variantId, qty) {
  const product = (await client.query("SELECT * FROM products WHERE id = $1", [productId])).rows[0];
  if (!product) return;

  if (product.tipo === "variacao" && product.parent_id) {
    const consumo = Number(product.consumo) || 1;
    return decrementStock(client, product.parent_id, null, qty * consumo);
  }
  if (product.tipo === "composicao") {
    const ingredientes = (await client.query("SELECT * FROM product_combo_items WHERE product_id = $1", [productId])).rows;
    for (const ing of ingredientes) {
      // eslint-disable-next-line no-await-in-loop
      await decrementStock(client, ing.ingredient_product_id, null, qty * Number(ing.qty));
    }
    return;
  }
  if (variantId) {
    await client.query("UPDATE product_variants SET stock = GREATEST(0, stock - $1) WHERE id = $2", [qty, variantId]);
    return;
  }
  const batches = (await client.query("SELECT * FROM product_batches WHERE product_id = $1 ORDER BY expiry_date ASC NULLS LAST", [productId])).rows;
  if (batches.length) {
    let remaining = qty;
    for (const b of batches) {
      if (remaining <= 0) break;
      const take = Math.min(Number(b.qty), remaining);
      // eslint-disable-next-line no-await-in-loop
      await client.query("UPDATE product_batches SET qty = qty - $1 WHERE id = $2", [take, b.id]);
      remaining -= take;
    }
    return;
  }
  await client.query("UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2", [qty, productId]);
}

// Inverso de decrementStock — usado ao cancelar uma venda.
export async function incrementStock(client, productId, variantId, qty) {
  const product = (await client.query("SELECT * FROM products WHERE id = $1", [productId])).rows[0];
  if (!product) return;

  if (product.tipo === "variacao" && product.parent_id) {
    const consumo = Number(product.consumo) || 1;
    return incrementStock(client, product.parent_id, null, qty * consumo);
  }
  if (product.tipo === "composicao") {
    const ingredientes = (await client.query("SELECT * FROM product_combo_items WHERE product_id = $1", [productId])).rows;
    for (const ing of ingredientes) {
      // eslint-disable-next-line no-await-in-loop
      await incrementStock(client, ing.ingredient_product_id, null, qty * Number(ing.qty));
    }
    return;
  }
  if (variantId) {
    await client.query("UPDATE product_variants SET stock = stock + $1 WHERE id = $2", [qty, variantId]);
    return;
  }
  const batch = (await client.query("SELECT * FROM product_batches WHERE product_id = $1 LIMIT 1", [productId])).rows[0];
  if (batch) {
    await client.query("UPDATE product_batches SET qty = qty + $1 WHERE id = $2", [qty, batch.id]);
    return;
  }
  await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [qty, productId]);
}
