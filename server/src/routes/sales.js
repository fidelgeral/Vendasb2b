import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness, requireRole } from "../auth/middleware.js";
import { buildStore } from "./store.js";
import { decrementStock, incrementStock } from "./caixa.js";

export const salesRouter = Router({ mergeParams: true });
salesRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

const itemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  name: z.string(),
  qty: z.number().positive(),
  price: z.number().min(0),
  cost: z.number().min(0).optional().default(0),
});
const paymentSchema = z.object({ method: z.string(), amount: z.number() });

const saleSchema = z.object({
  items: z.array(itemSchema).min(1),
  total: z.number().min(0),
  discount: z.number().min(0).optional().default(0),
  payments: z.array(paymentSchema).min(1),
  clientId: z.string().uuid().optional().nullable(),
  tableId: z.string().uuid().optional().nullable(),
  pontosUsados: z.number().optional().default(0),
});

function nextDocNumber(config) {
  const ds = config.docSeries || { prefixo: "FT", ano: new Date().getFullYear(), proximo: 1 };
  const anoActual = new Date().getFullYear();
  const ano = ds.ano === anoActual ? ds.ano : anoActual;
  const proximo = ds.ano === anoActual ? ds.proximo || 1 : 1;
  return { numero: (ds.prefixo || "FT") + ano + "/" + String(proximo).padStart(4, "0"), nextSeries: { prefixo: ds.prefixo || "FT", ano, proximo: proximo + 1 } };
}

salesRouter.post("/sales", async (req, res) => {
  const parsed = saleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados da venda inválidos.", details: parsed.error.flatten() });
  const f = parsed.data;
  const businessId = req.params.businessId;
  if (f.discount > 0 && !(req.auth.type === "super" || ["dono", "gerente"].includes(req.auth.role))) {
    return res.status(403).json({ error: "Sem permissão para aplicar desconto." });
  }
  const employee = req.auth.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };

  const shift = (await query("SELECT id FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];
  if (!shift) return res.status(409).json({ error: "Abra o caixa antes de vender." });

  const biz = (await query("SELECT config FROM businesses WHERE id = $1", [businessId])).rows[0];
  const doc = nextDocNumber(biz.config || {});
  const pontosGanhos = f.clientId ? Math.floor(f.total / (biz.config?.pontosPorMT || 50)) : 0;
  const fiadoAmount = f.payments.filter((p) => p.method === "fiado").reduce((s, p) => s + p.amount, 0);

  const sale = await withTransaction(async (client) => {
    const row = (
      await client.query(
        `INSERT INTO sales (business_id, shift_id, employee_id, client_id, table_id, numero, total, discount, payments, pontos_usados, pontos_ganhos)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, numero, created_at`,
        [businessId, shift.id, employee.id, f.clientId || null, f.tableId || null, doc.numero, f.total, f.discount, JSON.stringify(f.payments), f.pontosUsados, pontosGanhos]
      )
    ).rows[0];

    for (const it of f.items) {
      // eslint-disable-next-line no-await-in-loop
      await client.query(
        "INSERT INTO sale_items (sale_id, product_id, variant_id, name_snapshot, qty, price, cost) VALUES ($1,$2,$3,$4,$5,$6,$7)",
        [row.id, it.productId, it.variantId || null, it.name, it.qty, it.price, it.cost]
      );
      // eslint-disable-next-line no-await-in-loop
      await decrementStock(client, it.productId, it.variantId, it.qty);
    }

    if (fiadoAmount > 0 && f.clientId) {
      await client.query("INSERT INTO client_debts (client_id, sale_id, amount) VALUES ($1,$2,$3)", [f.clientId, row.id, fiadoAmount]);
    }
    if (f.clientId) {
      await client.query("UPDATE clients SET points = GREATEST(0, points - $1 + $2) WHERE id = $3", [f.pontosUsados, pontosGanhos, f.clientId]);
    }
    if (f.tableId) {
      await client.query("DELETE FROM comandas WHERE table_id = $1", [f.tableId]);
    }
    await client.query("UPDATE businesses SET config = jsonb_set(config, '{docSeries}', $1::jsonb) WHERE id = $2", [
      JSON.stringify(doc.nextSeries), businessId,
    ]);

    await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
      businessId, employee.id, employee.name, "VENDA", `Documento ${doc.numero}${f.tableId ? " (mesa)" : ""}`, f.total,
    ]);
    if (f.discount > 0) {
      await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
        businessId, employee.id, employee.name, "DESCONTO", `Desconto na venda ${doc.numero}`, f.discount,
      ]);
    }
    return row;
  });

  const store = await buildStore(businessId);
  res.status(201).json({ store, sale: store.sales.find((s) => s.id === sale.id) });
});

salesRouter.post("/sales/:id/void", requireRole("dono", "gerente"), async (req, res) => {
  const { businessId, id } = req.params;
  const reason = req.body?.reason || "";
  const employee = req.auth.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };

  const sale = (await query("SELECT * FROM sales WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (!sale) return res.status(404).json({ error: "Venda não encontrada." });
  if (sale.voided) return res.status(409).json({ error: "Venda já cancelada." });
  const items = (await query("SELECT * FROM sale_items WHERE sale_id = $1", [id])).rows;

  await withTransaction(async (client) => {
    for (const it of items) {
      // eslint-disable-next-line no-await-in-loop
      await incrementStock(client, it.product_id, it.variant_id, Number(it.qty));
    }
    await client.query("UPDATE sales SET voided = true, void_reason = $1 WHERE id = $2", [reason, id]);
    await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
      businessId, employee.id, employee.name, "CANCELAMENTO", `Venda ${sale.numero || id} — motivo: ${reason || "não indicado"}`, sale.total,
    ]);
  });

  await respond(res, businessId);
});

salesRouter.post("/parked", async (req, res) => {
  const businessId = req.params.businessId;
  const cart = req.body?.cart;
  if (!Array.isArray(cart) || !cart.length) return res.status(400).json({ error: "Carrinho vazio." });
  await query("INSERT INTO parked_sales (business_id, cart) VALUES ($1, $2::jsonb)", [businessId, JSON.stringify(cart)]);
  await respond(res, businessId, 201);
});

salesRouter.delete("/parked/:id", async (req, res) => {
  const { businessId, id } = req.params;
  await query("DELETE FROM parked_sales WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});
