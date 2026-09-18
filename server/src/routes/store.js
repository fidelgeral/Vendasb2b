import { Router } from "express";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";

export const storeRouter = Router({ mergeParams: true });
storeRouter.use(requireAuth, requireBusiness);

const DEFAULT_CONFIG = {
  businessName: "",
  modules: { mercearia: true, restaurante: false, bar: false, roupa: false, padaria: false },
  receiptMessage: "Obrigado pela preferência! Volte sempre.",
  impressao: { papel: "80mm", visorCliente: false },
  iva: { taxa: 16, precosIncluemIva: true, isento: false },
  contas: {
    dinheiro: { activo: true },
    mpesa: { activo: true, numero: "", titular: "" },
    emola: { activo: true, numero: "", titular: "" },
  },
  empresa: { nome: "", nuit: "", endereco: "", cidade: "", contacto: "", email: "", regime: "Geral" },
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
      `SELECT b.id, b.product_id, b.qty, b.expiry_date AS "expiryDate" FROM product_batches b
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
      `SELECT id, name, email, phone, doc_id AS "docId", role, active, created_at AS "createdAt"
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
              opened_at AS "openedAt", closed_at AS "closedAt"
       FROM shifts WHERE business_id = $1 ORDER BY opened_at DESC LIMIT 200`,
      [businessId]
    ),
    query(
      `SELECT id, numero, created_at AS date, total, discount, payments, client_id AS "clientId",
              employee_id AS "employeeId", shift_id AS "shiftId", table_id AS "tableId",
              CASE WHEN voided THEN 'void' ELSE 'completed' END AS status,
              void_reason AS "voidReason", pontos_usados AS "pontosUsados", pontos_ganhos AS "pontosGanhos"
       FROM sales WHERE business_id = $1 ORDER BY created_at DESC LIMIT 2000`,
      [businessId]
    ),
    query(
      `SELECT si.id, si.sale_id, si.product_id AS "productId", si.variant_id AS "variantId",
              si.name_snapshot AS name, si.qty, si.price, si.cost
       FROM sale_items si JOIN sales s ON s.id = si.sale_id WHERE s.business_id = $1`,
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
       FROM audit_log WHERE business_id = $1 ORDER BY created_at DESC LIMIT 1000`,
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
    const bs = (batchesByProduct[p.id] || []).map((b) => ({ id: b.id, qty: Number(b.qty), expiryDate: b.expiryDate }));
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
  const store = await buildStore(req.params.businessId);
  if (!store) return res.status(404).json({ error: "Negócio não encontrado." });
  res.json({ store });
});
