import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { requirePermission } from "../permissions.js";

export const storeRouter = Router({ mergeParams: true });
storeRouter.use(requireAuth, requireBusiness);

const storeCache = new Map();
const CACHE_TTL = 30_000;

export function invalidateStoreCache(businessId) {
  storeCache.delete(businessId);
}

async function getCachedStore(businessId) {
  const cached = storeCache.get(businessId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  const data = await buildStore(businessId);
  storeCache.set(businessId, { data, ts: Date.now() });
  return data;
}

// Wrapper chamado pelas rotas de escrita: reconstroi o store e actualiza a cache
export async function buildStoreAndCache(businessId) {
  const data = await buildStore(businessId);
  storeCache.set(businessId, { data, ts: Date.now() });
  return data;
}

const DEFAULT_CONFIG = {
  businessName: "",
  modules: { mercearia: true, restaurante: false, bar: false, roupa: false, padaria: false },
  receiptMessage: "Obrigado pela preferência! Volte sempre.",
  impressao: { papel: "80mm", visorCliente: false, imprimirAoFinalizar: false, scannerUsb: true },
  iva: { taxa: 0, precosIncluemIva: true, isento: false, taxas: [] },
  contas: {
    dinheiro: { activo: true },
    mpesa: { activo: true, numero: "", titular: "" },
    emola: { activo: true, numero: "", titular: "" },
  },
  empresa: { nome: "", nuit: "", endereco: "", cidade: "", contacto: "", email: "", regime: "Geral", logo: "" },
  docSeries: { prefixo: "FT", ano: new Date().getFullYear(), proximo: 1 },
  pontosPorMT: 50,
};

function mergeConfig(saved) {
  const s = saved || {};
  return {
    ...DEFAULT_CONFIG,
    ...s,
    modules: { ...DEFAULT_CONFIG.modules, ...(s.modules || {}) },
    impressao: { ...DEFAULT_CONFIG.impressao, ...(s.impressao || {}) },
    iva: { ...DEFAULT_CONFIG.iva, ...(s.iva || {}) },
    contas: {
      dinheiro: { ...DEFAULT_CONFIG.contas.dinheiro, ...(s.contas?.dinheiro || {}) },
      mpesa: { ...DEFAULT_CONFIG.contas.mpesa, ...(s.contas?.mpesa || {}) },
      emola: { ...DEFAULT_CONFIG.contas.emola, ...(s.contas?.emola || {}) },
    },
    empresa: { ...DEFAULT_CONFIG.empresa, ...(s.empresa || {}) },
    docSeries: { ...DEFAULT_CONFIG.docSeries, ...(s.docSeries || {}) },
  };
}

// Monta o mesmo formato de objecto que o protótipo produzia a partir do
// documento único (withDefaults()/buildSeedStore()), agora a partir de
// tabelas relacionais — para o código de UI já existente continuar a funcionar.
export async function buildStore(businessId) {
  const biz = (await query("SELECT * FROM businesses WHERE id = $1", [businessId])).rows[0];
  if (!biz) return null;

  const [
    products,
    variants,
    batches,
    comboItems,
    categories,
    clients,
    debts,
    employees,
    suppliers,
    purchases,
    tables,
    comandas,
    shifts,
    sales,
    saleItems,
    parkedSales,
    quebras,
    movimentos,
    audit,
    contasPagar,
    cotacoes,
    transfers,
    cashShortages,
    loyaltyPoints,
  ] = await Promise.all([
    query(
      `SELECT id, tipo, venda_directa AS "vendaDirecta", codigo, name, category, unit, qtd_itens AS "qtdItens",
              iva_taxa AS "ivaTaxa", price, cost, min_stock AS "minStock", prazo_reembolso AS "prazoReembolso",
              foto, stock, parent_id AS "parentId", consumo, fornecedor_id AS "fornecedorId", active, created_at AS "createdAt"
       FROM products WHERE business_id = $1 ORDER BY name`,
      [businessId]
    ),
    query(
      `SELECT v.id, v.product_id, v.label, v.stock FROM product_variants v
       JOIN products p ON p.id = v.product_id WHERE p.business_id = $1`,
      [businessId]
    ),
    query(
      `SELECT b.id, b.product_id, b.qty, b.expiry_date AS "expiryDate",
              b.name, b.cost_total AS "costTotal", b.supplier_id AS "supplierId",
              b.initial_qty AS "initialQty", b.created_at AS "createdAt"
       FROM product_batches b
       JOIN products p ON p.id = b.product_id WHERE p.business_id = $1`,
      [businessId]
    ),
    query(
      `SELECT ci.id, ci.product_id, ci.ingredient_product_id AS "productId", ci.qty FROM product_combo_items ci
       JOIN products p ON p.id = ci.product_id WHERE p.business_id = $1`,
      [businessId]
    ),
    query(`SELECT name FROM categories WHERE business_id = $1 ORDER BY name`, [businessId]),
    query(
      `SELECT id, name, tipo, phone, email, nuit, endereco, cidade, credit_limit AS "creditLimit",
              notas, points, active, created_at AS "createdAt"
       FROM clients WHERE business_id = $1 ORDER BY name`,
      [businessId]
    ),
    query(
      `SELECT d.id, d.client_id, d.sale_id AS "saleId", d.amount, d.created_at AS date FROM client_debts d
       JOIN clients c ON c.id = d.client_id WHERE c.business_id = $1`,
      [businessId]
    ),
    query(
      `SELECT id, name, email, phone, doc_id AS "docId", role, active, permissions, genero, foto, garcom, allowed_filiais AS "allowedFiliais", created_at AS "createdAt"
       FROM employees WHERE business_id = $1 ORDER BY name`,
      [businessId]
    ),
    query(
      `SELECT id, name, contacto, phone, email, nuit, endereco, prazo, created_at AS "createdAt"
       FROM suppliers WHERE business_id = $1 ORDER BY name`,
      [businessId]
    ),
    query(
      `SELECT id, supplier_id AS "supplierId", product_id AS "productId", qty, cost, total, created_at AS date
       FROM purchases WHERE business_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [businessId]
    ),
    query(`SELECT id, label, seats FROM tables WHERE business_id = $1 ORDER BY label`, [businessId]),
    query(
      `SELECT id, table_id AS "tableId", items, service_charge_pct AS "serviceChargePct", opened_at AS "openedAt"
       FROM comandas WHERE business_id = $1`,
      [businessId]
    ),
    query(
      `SELECT id, opening_cash AS "openingCash", closing_cash AS "closingCash", expected_cash AS "expectedCash",
              opened_at AS "openedAt", closed_at AS "closedAt", opened_by AS "openedBy", closed_by AS "closedBy"
       FROM shifts WHERE business_id = $1 ORDER BY opened_at DESC LIMIT 200`,
      [businessId]
    ),
    query(
      `SELECT id, numero, created_at AS date, total, discount, payments, client_id AS "clientId",
              employee_id AS "employeeId", shift_id AS "shiftId", table_id AS "tableId",
              CASE WHEN voided THEN 'void' ELSE 'completed' END AS status,
              void_reason AS "voidReason", pontos_usados AS "pontosUsados", pontos_ganhos AS "pontosGanhos",
              iva_taxa AS "ivaTaxa"
       FROM sales WHERE business_id = $1 ORDER BY created_at DESC LIMIT 120`,
      [businessId]
    ),
    query(
      `SELECT si.id, si.sale_id, si.product_id AS "productId", si.variant_id AS "variantId",
              si.name_snapshot AS name, si.qty, si.price, si.cost
       FROM sale_items si
       WHERE si.sale_id IN (
         SELECT id FROM sales WHERE business_id = $1 ORDER BY created_at DESC LIMIT 120
       )`,
      [businessId]
    ),
    query(`SELECT id, cart, created_at AS date FROM parked_sales WHERE business_id = $1`, [businessId]),
    query(
      `SELECT id, product_id AS "productId", variant_id AS "variantId", qty, motivo,
              custo_impacto AS "custoImpacto", shift_id AS "shiftId", created_at AS date
       FROM quebras WHERE business_id = $1 ORDER BY created_at DESC LIMIT 500`,
      [businessId]
    ),
    query(
      `SELECT id, tipo AS type, categoria, amount, descricao AS motivo, employee_id AS "employeeId",
              shift_id AS "shiftId", created_at AS date
       FROM movimentos_caixa WHERE business_id = $1 ORDER BY created_at DESC LIMIT 1000`,
      [businessId]
    ),
    query(
      `SELECT id, employee_id AS "employeeId", employee_name AS "employeeName", acao, detalhe, valor, created_at AS date
       FROM audit_log WHERE business_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [businessId]
    ),
    query(
      `SELECT id, descricao, categoria, valor, supplier_id AS "supplierId", vencimento,
              estado, paga_em AS "pagaEm", created_at AS "createdAt"
       FROM contas_pagar WHERE business_id = $1 ORDER BY (estado='paga'), vencimento NULLS LAST`,
      [businessId]
    ),
    query(
      `SELECT id, numero, client_id AS "clientId", items, total, discount, iva_taxa AS "ivaTaxa",
              status, created_at AS date
       FROM quotations WHERE business_id = $1 AND status = 'aberta' ORDER BY created_at DESC LIMIT 200`,
      [businessId]
    ),
    query(
      `SELECT t.id, t.from_business_id AS "fromBusinessId", t.to_business_id AS "toBusinessId",
              t.product_name AS "productName", t.qty, t.cost_unit AS "costUnit",
              t.employee_name AS "employeeName", t.nota, t.created_at AS date,
              fb.name AS "fromName", tb.name AS "toName"
       FROM stock_transfers t
       LEFT JOIN businesses fb ON fb.id = t.from_business_id
       LEFT JOIN businesses tb ON tb.id = t.to_business_id
       WHERE t.from_business_id = $1 OR t.to_business_id = $1
       ORDER BY t.created_at DESC LIMIT 100`,
      [businessId]
    ),
    query(
      `SELECT id, shift_id AS "shiftId", employee_id AS "employeeId", employee_name AS "employeeName",
              expected, declared, shortage, paid, paid_at AS "paidAt", nota, created_at AS "createdAt"
       FROM cash_shortages WHERE business_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [businessId]
    ),
    query(
      `SELECT lp.client_id AS "clientId", lp.points, lp.total_earned AS "totalEarned", lp.total_redeemed AS "totalRedeemed"
       FROM loyalty_points lp WHERE lp.business_id = $1`,
      [businessId]
    ),
  ]);

  const variantsByProduct = groupBy(variants.rows, "product_id");
  const batchesByProduct = groupBy(batches.rows, "product_id");
  const comboByProduct = groupBy(comboItems.rows, "product_id");
  const itemsBySale = groupBy(saleItems.rows, "sale_id");
  const debtsByClient = groupBy(debts.rows, "client_id");

  const productList = products.rows.map((p) => {
    const out = {
      ...p,
      price: Number(p.price),
      cost: Number(p.cost),
      minStock: Number(p.minStock),
      stock: Number(p.stock),
      consumo: Number(p.consumo),
      ivaTaxa: p.ivaTaxa === null ? null : Number(p.ivaTaxa),
    };
    const vs = (variantsByProduct[p.id] || []).map((v) => ({ id: v.id, label: v.label, stock: Number(v.stock) }));
    const bs = (batchesByProduct[p.id] || []).map((b) => ({
      id: b.id,
      qty: Number(b.qty),
      expiryDate: b.expiryDate,
      name: b.name,
      costTotal: Number(b.costTotal || 0),
      supplierId: b.supplierId,
      initialQty: Number(b.initialQty || 0),
      createdAt: b.createdAt,
    }));
    if (vs.length) out.variants = vs;
    if (bs.length) out.batches = bs;
    if (p.tipo === "composicao") out.ingredientes = (comboByProduct[p.id] || []).map((i) => ({ productId: i.productId, qty: Number(i.qty) }));
    return out;
  });

  const clientList = clients.rows.map((c) => ({
    ...c,
    creditLimit: Number(c.creditLimit),
    points: Number(c.points),
    debts: (debtsByClient[c.id] || []).map((d) => ({ id: d.id, amount: Number(d.amount), date: d.date, saleId: d.saleId })),
  }));

  const salesList = sales.rows.map((s) => ({
    ...s,
    total: Number(s.total),
    discount: Number(s.discount),
    pontosUsados: Number(s.pontosUsados),
    pontosGanhos: Number(s.pontosGanhos),
    ivaTaxa: s.ivaTaxa === null || s.ivaTaxa === undefined ? null : Number(s.ivaTaxa),
    items: (itemsBySale[s.id] || []).map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      name: it.name,
      qty: Number(it.qty),
      price: Number(it.price),
      cost: Number(it.cost),
    })),
  }));

  const currentShift = shifts.rows.find((s) => !s.closedAt);

  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    config: mergeConfig(biz.config),
    products: productList,
    categories: categories.rows.map((c) => c.name),
    clients: clientList,
    employees: employees.rows,
    suppliers: suppliers.rows,
    purchases: purchases.rows.map((p) => ({ ...p, qty: Number(p.qty), cost: Number(p.cost), total: Number(p.total) })),
    tables: tables.rows,
    comandas: comandas.rows.map((c) => ({ ...c, serviceChargePct: Number(c.serviceChargePct) })),
    shifts: shifts.rows.map((s) => ({
      ...s,
      openingCash: Number(s.openingCash),
      closingCash: s.closingCash === null ? null : Number(s.closingCash),
      expectedCash: s.expectedCash === null ? null : Number(s.expectedCash),
    })),
    sales: salesList,
    parkedSales: parkedSales.rows,
    quebras: quebras.rows.map((q) => ({ ...q, qty: Number(q.qty), custoImpacto: Number(q.custoImpacto) })),
    movimentosCaixa: movimentos.rows.map((m) => ({ ...m, amount: Number(m.amount) })),
    audit: audit.rows.map((a) => ({ ...a, valor: a.valor === null ? null : Number(a.valor) })),
    contasPagar: contasPagar.rows.map((c) => ({ ...c, valor: Number(c.valor) })),
    cotacoes: cotacoes.rows.map((c) => ({ ...c, total: Number(c.total), discount: Number(c.discount), ivaTaxa: c.ivaTaxa === null ? null : Number(c.ivaTaxa) })),
    transfers: transfers.rows.map((t) => ({ ...t, qty: Number(t.qty), costUnit: Number(t.costUnit) })),
    cashShortages: cashShortages.rows.map((s) => ({ ...s, expected: Number(s.expected), declared: Number(s.declared), shortage: Number(s.shortage) })),
    loyaltyPoints: loyaltyPoints.rows.map((lp) => ({ ...lp, points: Number(lp.points), totalEarned: Number(lp.totalEarned), totalRedeemed: Number(lp.totalRedeemed) })),
    loyalty: { enabled: !!biz.loyalty_enabled, pointsPerMt: Number(biz.loyalty_points_per_mt || 1), mtPerPoint: Number(biz.loyalty_mt_per_point || 0.1) },
    themeColor: biz.theme_color || "#2563eb",
    logoUrl: biz.logo_url || "",
    onboardingDone: !!biz.onboarding_done,
    currentShiftId: currentShift ? currentShift.id : null,
  };
}

function groupBy(rows, key) {
  const out = {};
  for (const r of rows) {
    (out[r[key]] ||= []).push(r);
  }
  return out;
}

storeRouter.get("/store", async (req, res) => {
  const store = await getCachedStore(req.params.businessId);
  if (!store) return res.status(404).json({ error: "Negócio não encontrado." });
  res.set("Cache-Control", "private, no-cache");
  res.json({ store });
});

// Histórico completo por período — usado só quando se abre o Balanço, para não
// carregar milhares de vendas no arranque normal do sistema.
// Histórico de alterações de uma entidade (fornecedor, categoria, produto, …):
// o que mudou, quem mudou e quando.
storeRouter.get("/audit-entidade", async (req, res) => {
  const { type, id } = req.query;
  if (!type || !id) return res.status(400).json({ error: "Indique type e id." });
  const movimentos = (
    await query(
      `SELECT id, acao, detalhe, valor, employee_name AS "employeeName", created_at AS date
       FROM audit_log WHERE business_id = $1 AND entity_type = $2 AND entity_id = $3
       ORDER BY created_at DESC LIMIT 200`,
      [req.params.businessId, type, String(id)]
    )
  ).rows;
  res.json({ movimentos });
});

// Pesquisa de imagens livres de direitos de autor (proxy para a API do
// Openverse). Só devolve imagens com licença que permite uso comercial e
// modificação, para serem seguras num negócio. Sem chave de API.
// Pesquisa de imagens livres de direitos, via Wikimedia Commons (gratuito, sem
// chave de API; o Commons só aloja ficheiros com licença livre). Devolve
// miniaturas grandes (400px) para a pessoa escolher.
storeRouter.get("/image-search", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ results: [] });
  try {
    const url =
      "https://commons.wikimedia.org/w/api.php?" +
      new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrsearch: `filetype:bitmap ${q}`,
        gsrnamespace: "6", // ficheiros
        gsrlimit: "24",
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiurlwidth: "400", // miniatura grande
      }).toString();
    const r = await fetch(url, { headers: { "User-Agent": "VENDASB2B/1.0 (POS; https://vendasb2b.vercel.app)" } });
    if (!r.ok) return res.status(502).json({ error: "Não foi possível pesquisar imagens agora.", results: [] });
    const data = await r.json();
    const pages = data.query && data.query.pages ? Object.values(data.query.pages) : [];
    const results = pages
      .filter((p) => p.imageinfo && p.imageinfo[0] && p.imageinfo[0].thumburl)
      .sort((a, b) => (a.index || 0) - (b.index || 0)) // mantém a ordem de relevância da pesquisa
      .map((p) => {
        const ii = p.imageinfo[0];
        const meta = ii.extmetadata || {};
        const limpa = (v) => String(v || "").replace(/<[^>]+>/g, "").trim();
        return {
          id: String(p.pageid),
          thumbnail: ii.thumburl,
          url: ii.url,
          title: (p.title || "").replace(/^File:/i, ""),
          source: "Wikimedia Commons",
          license: limpa(meta.LicenseShortName && meta.LicenseShortName.value),
          creator: limpa(meta.Artist && meta.Artist.value),
        };
      });
    res.json({ results });
  } catch (e) {
    res.status(502).json({ error: "Não foi possível pesquisar imagens agora.", results: [] });
  }
});

storeRouter.get("/history", requirePermission("verBalanco"), async (req, res) => {
  const businessId = req.params.businessId;
  const from = req.query.from || "1900-01-01";
  const to = req.query.to || "2999-12-31";

  const [sales, saleItems, quebras, movimentos, audit, purchases] = await Promise.all([
    query(
      `SELECT id, numero, created_at AS date, total, discount, payments, client_id AS "clientId",
              employee_id AS "employeeId", shift_id AS "shiftId", table_id AS "tableId",
              CASE WHEN voided THEN 'void' ELSE 'completed' END AS status,
              void_reason AS "voidReason", pontos_usados AS "pontosUsados", pontos_ganhos AS "pontosGanhos"
       FROM sales WHERE business_id = $1 AND created_at::date BETWEEN $2 AND $3 ORDER BY created_at DESC`,
      [businessId, from, to]
    ),
    query(
      `SELECT si.sale_id, si.product_id AS "productId", si.variant_id AS "variantId",
              si.name_snapshot AS name, si.qty, si.price, si.cost
       FROM sale_items si JOIN sales s ON s.id = si.sale_id
       WHERE s.business_id = $1 AND s.created_at::date BETWEEN $2 AND $3`,
      [businessId, from, to]
    ),
    query(
      `SELECT id, product_id AS "productId", variant_id AS "variantId", qty, motivo,
              custo_impacto AS "custoImpacto", shift_id AS "shiftId", created_at AS date
       FROM quebras WHERE business_id = $1 AND created_at::date BETWEEN $2 AND $3 ORDER BY created_at DESC`,
      [businessId, from, to]
    ),
    query(
      `SELECT id, tipo AS type, categoria, amount, descricao AS motivo, employee_id AS "employeeId",
              shift_id AS "shiftId", created_at AS date
       FROM movimentos_caixa WHERE business_id = $1 AND created_at::date BETWEEN $2 AND $3 ORDER BY created_at DESC`,
      [businessId, from, to]
    ),
    query(
      `SELECT id, employee_id AS "employeeId", employee_name AS "employeeName", acao, detalhe, valor, created_at AS date
       FROM audit_log WHERE business_id = $1 AND created_at::date BETWEEN $2 AND $3 ORDER BY created_at DESC`,
      [businessId, from, to]
    ),
    query(
      `SELECT id, supplier_id AS "supplierId", product_id AS "productId", qty, cost, total, created_at AS date
       FROM purchases WHERE business_id = $1 AND created_at::date BETWEEN $2 AND $3 ORDER BY created_at DESC`,
      [businessId, from, to]
    ),
  ]);

  const itemsBySale = groupBy(saleItems.rows, "sale_id");
  const salesList = sales.rows.map((s) => ({
    ...s,
    total: Number(s.total),
    discount: Number(s.discount),
    pontosUsados: Number(s.pontosUsados),
    pontosGanhos: Number(s.pontosGanhos),
    items: (itemsBySale[s.id] || []).map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      name: it.name,
      qty: Number(it.qty),
      price: Number(it.price),
      cost: Number(it.cost),
    })),
  }));

  res.json({
    sales: salesList,
    quebras: quebras.rows.map((q) => ({ ...q, qty: Number(q.qty), custoImpacto: Number(q.custoImpacto) })),
    movimentosCaixa: movimentos.rows.map((m) => ({ ...m, amount: Number(m.amount) })),
    audit: audit.rows.map((a) => ({ ...a, valor: a.valor === null ? null : Number(a.valor) })),
    purchases: purchases.rows.map((p) => ({ ...p, qty: Number(p.qty), cost: Number(p.cost), total: Number(p.total) })),
  });
});
