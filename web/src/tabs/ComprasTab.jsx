import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, GREEN, BRICK, GOLD } from "../lib/theme.js";
import { fmtMT, todayStr, daysUntil, DESPESA_CATEGORIAS } from "../lib/utils.js";
import { Plus, X } from "../lib/icons.jsx";
import { StatCard } from "../components/Shared.jsx";

export default function ComprasTab({ store, setStore, api }) {
  const [sup, setSup] = useState({ name: "", contacto: "", phone: "", email: "", nuit: "", endereco: "", prazo: "" });
  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [expiryDate, setExpiryDate] = useState(todayStr());

  const addSupplier = async () => {
    if (!sup.name.trim()) return;
    setStore(
      await api.createSupplier({
        name: sup.name.trim(), contacto: sup.contacto.trim(), phone: sup.phone.trim(), email: sup.email.trim(),
        nuit: sup.nuit.trim(), endereco: sup.endereco.trim(), prazo: sup.prazo.trim(),
      })
    );
    setSup({ name: "", contacto: "", phone: "", email: "", nuit: "", endereco: "", prazo: "" });
  };
  const removeSupplier = async (id) => setStore(await api.deleteSupplier(id));

  const registerPurchase = async () => {
    if (!supplierId || !productId || !qty) return;
    setStore(await api.registerPurchase({ supplierId, productId, qty: Number(qty), cost: Number(cost) || 0, expiryDate: expiryDate || null }));
    setQty("");
    setCost("");
  };

  return (
    <div className="space-y-4">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
        <div className="text-sm font-semibold mb-2">Fornecedores</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <input placeholder="Nome / Empresa *" value={sup.name} onChange={(e) => setSup({ ...sup, name: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm sm:col-span-2" />
          <input placeholder="Pessoa de contacto" value={sup.contacto} onChange={(e) => setSup({ ...sup, contacto: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
          <input placeholder="Telefone" value={sup.phone} onChange={(e) => setSup({ ...sup, phone: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
          <input placeholder="Email" value={sup.email} onChange={(e) => setSup({ ...sup, email: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
          <input placeholder="NUIT" value={sup.nuit} onChange={(e) => setSup({ ...sup, nuit: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
          <input placeholder="Endereço" value={sup.endereco} onChange={(e) => setSup({ ...sup, endereco: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm sm:col-span-2" />
          <input placeholder="Prazo de pagamento (ex: 30 dias)" value={sup.prazo} onChange={(e) => setSup({ ...sup, prazo: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        </div>
        <button onClick={addSupplier} style={{ background: TEAL, color: "#fff" }} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
          <Plus size={14} /> Adicionar fornecedor
        </button>
        <div className="space-y-1.5 mt-3">
          {store.suppliers.map((s) => (
            <div key={s.id} style={{ borderColor: BORDER }} className="border rounded-lg p-2.5 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs" style={{ color: MUTED }}>
                  {[s.contacto, s.phone, s.email, s.nuit ? "NUIT " + s.nuit : "", s.prazo].filter(Boolean).join(" · ") || "sem detalhes"}
                </div>
                {s.endereco && (
                  <div className="text-xs" style={{ color: MUTED }}>
                    {s.endereco}
                  </div>
                )}
              </div>
              <button onClick={() => removeSupplier(s.id)}>
                <X size={15} style={{ color: "#EF4444" }} />
              </button>
            </div>
          ))}
          {store.suppliers.length === 0 && (
            <div className="text-xs" style={{ color: MUTED }}>
              Ainda não há fornecedores registados.
            </div>
          )}
        </div>
      </div>

      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
        <div className="text-sm font-semibold mb-2">Registar compra (entrada de stock)</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm">
            <option value="">Fornecedor</option>
            {store.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm">
            <option value="">Produto</option>
            {store.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input placeholder="Quantidade" type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
          <input placeholder="Custo unitário" type="number" value={cost} onChange={(e) => setCost(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <button onClick={registerPurchase} style={{ background: TEAL, color: "#fff" }} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
          <Plus size={14} /> Registar entrada
        </button>
      </div>

      <div className="space-y-1">
        {[...store.purchases]
          .reverse()
          .slice(0, 10)
          .map((p) => {
            const supplier = store.suppliers.find((s) => s.id === p.supplierId);
            const product = store.products.find((pr) => pr.id === p.productId);
            return (
              <div key={p.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg px-2.5 py-1.5 text-xs flex justify-between">
                <span>
                  {product?.name} × {p.qty} — {supplier?.name}
                </span>
                <span style={{ color: MUTED }}>{fmtMT(p.total)}</span>
              </div>
            );
          })}
      </div>

      <ContasPagar store={store} setStore={setStore} api={api} />
    </div>
  );
}

function ContasPagar({ store, setStore, api }) {
  const [form, setForm] = useState({ descricao: "", categoria: DESPESA_CATEGORIAS[0], valor: "", supplierId: "", vencimento: "" });
  const contas = store.contasPagar || [];
  const abertas = contas.filter((c) => c.estado === "aberta");
  const totalAberto = abertas.reduce((a, c) => a + c.valor, 0);

  // Fluxo de caixa simples: entradas de vendas em dinheiro + movimentos − contas em aberto.
  const vendasDinheiro = store.sales
    .filter((s) => s.status !== "void")
    .reduce((a, s) => a + s.payments.filter((p) => p.method === "dinheiro").reduce((x, p) => x + p.amount, 0), 0);
  const entradas = store.movimentosCaixa.filter((m) => m.type === "entrada").reduce((a, m) => a + m.amount, 0);
  const saidas = store.movimentosCaixa.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
  const saldoPrevisto = vendasDinheiro + entradas - saidas - totalAberto;

  const add = async () => {
    if (!form.descricao.trim() || !(Number(form.valor) > 0)) return;
    setStore(
      await api.addConta({
        descricao: form.descricao.trim(),
        categoria: form.categoria,
        valor: Number(form.valor),
        supplierId: form.supplierId || null,
        vencimento: form.vencimento || null,
      })
    );
    setForm({ descricao: "", categoria: DESPESA_CATEGORIAS[0], valor: "", supplierId: "", vencimento: "" });
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-3 space-y-3">
      <div className="text-sm font-semibold">Contas a pagar e fluxo de caixa</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <StatCard label="A pagar (em aberto)" value={fmtMT(totalAberto)} />
        <StatCard label="Vendas em dinheiro" value={fmtMT(vendasDinheiro)} />
        <StatCard label="Saldo previsto" value={fmtMT(saldoPrevisto)} sub="após pagar o que está em aberto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input placeholder="Descrição *" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm sm:col-span-2" />
        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm">
          {DESPESA_CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input placeholder="Valor (MT) *" type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
        <input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
      </div>
      <button onClick={add} style={{ background: TEAL, color: "#fff" }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm">
        <Plus size={14} /> Adicionar conta
      </button>

      <div className="space-y-1">
        {contas.length === 0 && <div className="text-xs" style={{ color: MUTED }}>Sem contas registadas.</div>}
        {contas.map((c) => {
          const paga = c.estado === "paga";
          const dias = c.vencimento ? daysUntil(String(c.vencimento).slice(0, 10)) : null;
          const atrasada = !paga && dias !== null && dias < 0;
          return (
            <div key={c.id} style={{ background: CARD, borderColor: atrasada ? BRICK : BORDER, opacity: paga ? 0.6 : 1 }} className="border rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between gap-2 flex-wrap">
              <span>
                <b>{c.descricao}</b> · {c.categoria} · {fmtMT(c.valor)}
                {c.vencimento ? " · vence " + new Date(c.vencimento).toLocaleDateString("pt-PT") : ""}
                {atrasada && <span style={{ color: BRICK }} className="font-semibold"> · ATRASADA</span>}
                {paga && <span style={{ color: GREEN }} className="font-semibold"> · PAGA</span>}
              </span>
              <span className="flex gap-2">
                {!paga && (
                  <button onClick={async () => setStore(await api.pagarConta(c.id))} style={{ color: GREEN }} className="font-semibold">
                    Marcar paga
                  </button>
                )}
                <button onClick={async () => setStore(await api.deleteConta(c.id))}>
                  <X size={13} style={{ color: BRICK }} />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
