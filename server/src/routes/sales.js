import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness, requireRole } from "../auth/middleware.js";
import { buildStoreAndCache } from "./store.js";
import { decrementStock, incrementStock } from "./caixa.js";
import { nextDocNumber } from "../docNumber.js";
import { requirePermission } from "../permissions.js";

export const salesRouter = Router({ mergeParams: true });
salesRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStoreAndCache(businessId) });

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
  ivaTaxa: z.number().min(0).optional().nullable(),
  // Identificador único gerado pelo cliente — torna o registo idempotente
  // (reenvios não criam vendas duplicadas).
  clientSaleId: z.string().max(100).optional().nullable(),
});

salesRouter.post("/sales", requirePermission("vender"), async (req, res) => {
  const parsed = saleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados da venda inválidos.", details: parsed.error.flatten() });
  const f = parsed.data;
  const businessId = req.params.businessId;
  if (f.discount > 0 && !(req.auth.type === "super" || ["dono", "gerente"].includes(req.auth.role))) {
    return res.status(403).json({ error: "Sem permissão para aplicar desconto." });
  }
  const employee = req.auth.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };

  try {
  const shift = (await query("SELECT id FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];
  if (!shift) return res.status(409).json({ error: "Abra o caixa antes de vender." });

  const fiadoAmount = f.payments.filter((p) => p.method === "fiado").reduce((s, p) => s + p.amount, 0);

  let duplicate = false;
  const sale = await withTransaction(async (client) => {
    // Bloqueia a linha do negócio PRIMEIRO. Isto serializa as vendas do mesmo
    // negócio: a verificação de idempotência e a numeração do documento passam
    // a correr uma de cada vez, sem corridas entre separadores/reenvios.
    const biz = (await client.query("SELECT config FROM businesses WHERE id = $1 FOR UPDATE", [businessId])).rows[0];

    // Idempotência: se esta venda já foi registada (mesmo clientSaleId), não
    // cria outra — devolve a que já existe.
    if (f.clientSaleId) {
      const existing = (
        await client.query("SELECT id FROM sales WHERE business_id = $1 AND client_sale_id = $2", [businessId, f.clientSaleId])
      ).rows[0];
      if (existing) {
        duplicate = true;
        return existing;
      }
    }

    const doc = nextDocNumber(biz.config || {});
    const pontosGanhos = f.clientId ? Math.floor(f.total / (biz.config?.pontosPorMT || 50)) : 0;

    const row = (
      await client.query(
        `INSERT INTO sales (business_id, shift_id, employee_id, client_id, table_id, numero, total, discount, payments, pontos_usados, pontos_ganhos, client_sale_id, iva_taxa)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id, numero, created_at`,
        [businessId, shift.id, employee.id, f.clientId || null, f.tableId || null, doc.numero, f.total, f.discount, JSON.stringify(f.payments), f.pontosUsados, pontosGanhos, f.clientSaleId || null, f.ivaTaxa == null ? null : f.ivaTaxa]
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
      if (biz.loyalty_enabled && pontosGanhos > 0) {
        await client.query(
          `INSERT INTO loyalty_points (business_id, client_id, points, total_earned)
           VALUES ($1,$2,$3,$3)
           ON CONFLICT (business_id, client_id) DO UPDATE SET points = loyalty_points.points + $3, total_earned = loyalty_points.total_earned + $3, updated_at = now()`,
          [businessId, f.clientId, pontosGanhos]
        );
        await client.query(
          "INSERT INTO loyalty_history (business_id, client_id, points, tipo, descricao, sale_id) VALUES ($1,$2,$3,'ganho',$4,$5)",
          [businessId, f.clientId, pontosGanhos, `Venda ${doc.numero}: +${pontosGanhos} pontos`, row.id]
        );
      }
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

  const store = await buildStoreAndCache(businessId);
  res.status(duplicate ? 200 : 201).json({ store, sale: store.sales.find((s) => s.id === sale.id) });
  } catch (err) {
    // Rede de segurança: se ainda assim duas vendas idênticas colidirem no
    // índice único (23505), devolve a venda que ficou registada — nunca um
    // duplicado nem uma falha para o utilizador.
    if (err && err.code === "23505" && f.clientSaleId) {
      const existente = (
        await query("SELECT id FROM sales WHERE business_id = $1 AND client_sale_id = $2", [businessId, f.clientSaleId])
      ).rows[0];
      if (existente) {
        const store = await buildStoreAndCache(businessId);
        return res.status(200).json({ store, sale: store.sales.find((s) => s.id === existente.id) });
      }
    }
    console.error(err);
    return res.status(500).json({ error: "Não foi possível registar a venda." });
  }
});

salesRouter.post("/sales/:id/email-receipt", async (req, res) => {
  const { businessId, id } = req.params;
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email obrigatório." });
  if (!process.env.RESEND_API_KEY) return res.status(501).json({ error: "Serviço de email não configurado." });

  const sale = (await query("SELECT * FROM sales WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (!sale) return res.status(404).json({ error: "Venda não encontrada." });
  const items = (await query("SELECT * FROM sale_items WHERE sale_id = $1", [id])).rows;
  const biz = (await query("SELECT name, config FROM businesses WHERE id = $1", [businessId])).rows[0];
  const emp = (biz.config || {}).empresa || {};
  const empresaNome = emp.nome || biz.name || "Loja";

  const linhasHtml = items.map((it) => `<tr><td style="padding:4px 8px">${it.name_snapshot}</td><td style="padding:4px 8px;text-align:right">${it.qty}</td><td style="padding:4px 8px;text-align:right">${Number(it.price).toFixed(2)} MT</td><td style="padding:4px 8px;text-align:right">${(Number(it.price) * Number(it.qty)).toFixed(2)} MT</td></tr>`).join("");

  const html = `<div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;padding:20px">
    <h2 style="color:#4F46E5">${empresaNome}</h2>
    ${emp.endereco ? `<p style="color:#666;font-size:12px">${emp.endereco}${emp.contacto ? " · Tel: " + emp.contacto : ""}${emp.nuit ? " · NUIT: " + emp.nuit : ""}</p>` : ""}
    <hr style="border:none;border-top:1px solid #eee"/>
    <p><strong>Documento:</strong> ${sale.numero || "—"}</p>
    <p><strong>Data:</strong> ${new Date(sale.created_at).toLocaleString("pt-PT")}</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#4F46E5;color:#fff"><th style="padding:6px 8px;text-align:left">Artigo</th><th style="padding:6px 8px;text-align:right">Qtd</th><th style="padding:6px 8px;text-align:right">Preço</th><th style="padding:6px 8px;text-align:right">Total</th></tr></thead>
      <tbody>${linhasHtml}</tbody>
    </table>
    <div style="text-align:right;font-size:18px;font-weight:bold;margin:12px 0;color:#4F46E5">TOTAL: ${Number(sale.total).toFixed(2)} MT</div>
    <hr style="border:none;border-top:1px solid #eee"/>
    <p style="color:#999;font-size:11px;text-align:center">${(biz.config || {}).receiptMessage || "Obrigado pela preferência!"}</p>
    <p style="color:#bbb;font-size:10px;text-align:center">Processado por VENDASB2B</p>
  </div>`;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: process.env.RESEND_FROM || "noreply@vendasb2b.com", to: [email], subject: `Recibo ${sale.numero || ""} — ${empresaNome}`, html }),
    });
    if (!resp.ok) return res.status(502).json({ error: "Falha ao enviar email." });
    res.json({ ok: true });
  } catch { res.status(502).json({ error: "Falha ao enviar email." }); }
});

salesRouter.post("/sales/:id/void", requirePermission("quebras"), async (req, res) => {
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
    // Reverte a dívida (fiado) criada por esta venda — uma venda cancelada não
    // pode continuar a "contar" como dívida do cliente.
    await client.query("DELETE FROM client_debts WHERE sale_id = $1", [id]);
    // Reverte os pontos de fidelidade: tira os que foram ganhos e devolve os
    // que foram usados nesta venda.
    if (sale.client_id) {
      await client.query("UPDATE clients SET points = GREATEST(0, points - $1 + $2) WHERE id = $3", [
        Number(sale.pontos_ganhos || 0), Number(sale.pontos_usados || 0), sale.client_id,
      ]);
    }
    await client.query("UPDATE sales SET voided = true, void_reason = $1 WHERE id = $2", [reason, id]);
    await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
      businessId, employee.id, employee.name, "CANCELAMENTO", `Venda ${sale.numero || id} — motivo: ${reason || "não indicado"}`, sale.total,
    ]);
  });

  await respond(res, businessId);
});

salesRouter.post("/parked", requirePermission("guardarPedido"), async (req, res) => {
  const businessId = req.params.businessId;
  const cart = req.body?.cart;
  if (!Array.isArray(cart) || !cart.length) return res.status(400).json({ error: "Carrinho vazio." });
  await query("INSERT INTO parked_sales (business_id, cart) VALUES ($1, $2::jsonb)", [businessId, JSON.stringify(cart)]);
  await respond(res, businessId, 201);
});

salesRouter.delete("/parked/:id", requirePermission("guardarPedido"), async (req, res) => {
  const { businessId, id } = req.params;
  await query("DELETE FROM parked_sales WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});
