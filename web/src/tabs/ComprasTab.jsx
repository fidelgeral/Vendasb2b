import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL } from "../lib/theme.js";
import { fmtMT, todayStr } from "../lib/utils.js";
import { Plus, X } from "../lib/icons.jsx";

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
          <input placeholder="Nome / Empresa *" value={sup.name} onChange={(e) => setSup({ ...sup, name: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm sm:col-span-2" />
          <input placeholder="Pessoa de contacto" value={sup.contacto} onChange={(e) => setSup({ ...sup, contacto: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="Telefone" value={sup.phone} onChange={(e) => setSup({ ...sup, phone: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="Email" value={sup.email} onChange={(e) => setSup({ ...sup, email: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="NUIT" value={sup.nuit} onChange={(e) => setSup({ ...sup, nuit: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="Endereço" value={sup.endereco} onChange={(e) => setSup({ ...sup, endereco: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm sm:col-span-2" />
          <input placeholder="Prazo de pagamento (ex: 30 dias)" value={sup.prazo} onChange={(e) => setSup({ ...sup, prazo: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        </div>
        <button onClick={addSupplier} style={{ background: TEAL, color: "#fff" }} className="px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5">
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
                <X size={15} style={{ color: "#B23A2E" }} />
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
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Fornecedor</option>
            {store.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Produto</option>
            {store.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input placeholder="Quantidade" type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
          <input placeholder="Custo unitário" type="number" value={cost} onChange={(e) => setCost(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <button onClick={registerPurchase} style={{ background: TEAL, color: "#fff" }} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded text-sm">
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
              <div key={p.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded px-2.5 py-1.5 text-xs flex justify-between">
                <span>
                  {product?.name} × {p.qty} — {supplier?.name}
                </span>
                <span style={{ color: MUTED }}>{fmtMT(p.total)}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
