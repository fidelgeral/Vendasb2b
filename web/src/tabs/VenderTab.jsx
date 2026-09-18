import { useEffect, useMemo, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GOLD, BRICK, SOFTGOLD } from "../lib/theme.js";
import { fmtMT, getStock, uid } from "../lib/utils.js";
import { imprimirReciboTermico, gerarReciboPDF } from "../lib/print.js";
import { ProductCard, CheckoutPanel, VoidModal } from "../components/Shared.jsx";
import { Minus, Plus, Trash2, PauseCircle, PlayCircle } from "../lib/icons.jsx";

export default function VenderTab({ store, setStore, api, finalizeSale, voidSale, shiftOpen, canDiscount, canVoid, showToast, paymentMethods }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [variantPicker, setVariantPicker] = useState(null);
  const [showParked, setShowParked] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [vendaRapida, setVendaRapida] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = store.products.filter(
    (p) => p.active !== false && p.vendaDirecta !== false && (p.name.toLowerCase().includes(q) || (p.codigo || "").toLowerCase().includes(q))
  );

  const favoritos = useMemo(() => {
    const agg = {};
    store.sales.filter((s) => s.status !== "void").forEach((s) => s.items.forEach((it) => (agg[it.productId] = (agg[it.productId] || 0) + it.qty)));
    return Object.entries(agg)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => store.products.find((p) => p.id === id))
      .filter((p) => p && p.active !== false && getStock(p, store.products) > 0)
      .slice(0, 8);
  }, [store.sales, store.products]);

  const vendaImediata = async (p) => {
    if (!shiftOpen) {
      showToast("Abra o caixa antes de vender", "warn");
      return;
    }
    if (getStock(p, store.products) <= 0) return;
    if (p.variants && p.variants.length) {
      setVariantPicker(p);
      return;
    }
    const qty = 1;
    await finalizeSale({
      items: [{ productId: p.id, variantId: null, name: p.name, qty, price: p.price, cost: p.cost }],
      total: p.price * qty,
      discount: 0,
      payments: [{ method: "dinheiro", amount: p.price * qty }],
      clientId: null,
    });
  };

  const addToCart = (p, variant) => {
    if (getStock(p, store.products) <= 0) return;
    if (p.variants && p.variants.length && !variant) {
      setVariantPicker(p);
      return;
    }
    const key = p.id + (variant ? variant.id : "");
    setCart((c) => {
      const existing = c.find((x) => x.productId === p.id && x.variantId === (variant?.id || null));
      if (existing) {
        return c.map((x) => (x === existing ? { ...x, qty: x.qty + (p.unit === "un" ? 1 : 0.5) } : x));
      }
      return [
        ...c,
        {
          lineId: key + uid(),
          productId: p.id,
          variantId: variant ? variant.id : null,
          name: p.name + (variant ? " (" + variant.label + ")" : ""),
          price: p.price,
          cost: p.cost,
          unit: p.unit,
          qty: p.unit === "un" ? 1 : 0.5,
        },
      ];
    });
    setVariantPicker(null);
  };

  const updateQty = (lineId, qty) => setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(0, qty) } : l)).filter((l) => l.qty > 0));
  const removeLine = (lineId) => setCart((c) => c.filter((l) => l.lineId !== lineId));

  const parkSale = async () => {
    if (cart.length === 0) return;
    const next = await api.parkSale(cart);
    setStore(next);
    setCart([]);
    showToast("Venda colocada em espera");
  };
  const resumeSale = async (parked) => {
    setCart(parked.cart);
    const next = await api.resumeSale(parked.id);
    setStore(next);
    setShowParked(false);
  };

  const handleConfirm = async ({ total, discount, payments, clientId, pontosUsados }) => {
    if (!shiftOpen) {
      showToast("Abra o caixa antes de vender", "warn");
      return;
    }
    await finalizeSale({
      items: cart.map((l) => ({ productId: l.productId, variantId: l.variantId, name: l.name, qty: l.qty, price: l.price, cost: l.cost })),
      total,
      discount,
      payments,
      clientId,
      pontosUsados,
    });
    setCart([]);
  };

  const recentSales = [...store.sales].reverse().slice(0, 8);

  // leitor de código de barras: deteta digitação muito rápida terminada em Enter
  useEffect(() => {
    let buf = "";
    let last = 0;
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const emCampo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "F3") {
        e.preventDefault();
        const el = document.getElementById("pdv-busca");
        if (el) el.focus();
        return;
      }
      if (e.key === "Escape" && !emCampo) {
        setCart([]);
        return;
      }
      if (e.key === "F2") {
        e.preventDefault();
        const btn = document.getElementById("pdv-finalizar-dinheiro");
        if (btn) btn.click();
        return;
      }
      if (emCampo) return;
      const now = Date.now();
      if (now - last > 80) buf = "";
      last = now;
      if (e.key === "Enter") {
        if (buf.length >= 3) {
          const found = store.products.find((p) => (p.codigo || "").toLowerCase() === buf.toLowerCase());
          if (found) {
            addToCart(found);
            showToast(found.name + " adicionado");
          } else {
            showToast("Código não encontrado: " + buf, "warn");
          }
        }
        buf = "";
        return;
      }
      if (e.key.length === 1) buf += e.key;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store.products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <input
            id="pdv-busca"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar produto ou ler código de barras… (F3)"
            style={{ borderColor: BORDER, background: CARD }}
            className="flex-1 border rounded px-3 py-2 text-sm outline-none"
          />
          <button onClick={() => setVendaRapida((v) => !v)} style={{ borderColor: vendaRapida ? GOLD : BORDER, color: vendaRapida ? GOLD : MUTED, background: vendaRapida ? SOFTGOLD : CARD }} className="border rounded px-2.5 py-2 text-xs font-medium whitespace-nowrap">
            Venda rápida
          </button>
          {store.parkedSales.length > 0 && (
            <button onClick={() => setShowParked(true)} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-2.5 py-2 text-xs flex items-center gap-1">
              <PlayCircle size={13} /> {store.parkedSales.length} em espera
            </button>
          )}
        </div>
        {favoritos.length > 0 && !q && (
          <div className="mb-3">
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: MUTED }}>
              MAIS VENDIDOS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {favoritos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => (vendaRapida ? vendaImediata(p) : addToCart(p))}
                  style={{ background: SOFTGOLD, borderColor: GOLD, color: INK }}
                  className="border rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  {p.name} · {fmtMT(p.price)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} compact produtos={store.products} disabled={getStock(p, store.products) <= 0} onClick={() => (vendaRapida ? vendaImediata(p) : addToCart(p))} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm" style={{ color: MUTED }}>
              Nenhum produto encontrado.
            </div>
          )}
        </div>

        {recentSales.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold mb-1.5" style={{ color: MUTED }}>
              Vendas recentes
            </div>
            <div className="space-y-1">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  style={{ background: CARD, borderColor: BORDER, opacity: s.status === "void" ? 0.5 : 1 }}
                  className="border rounded px-2.5 py-1.5 flex items-center justify-between text-xs"
                >
                  <span>
                    {s.numero ? s.numero + " · " : ""}
                    {new Date(s.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · {fmtMT(s.total)}
                    {s.status === "void" && " · CANCELADA"}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <button onClick={() => imprimirReciboTermico(s, store, store.clients)} style={{ color: TEAL }} className="font-medium">
                      Imprimir
                    </button>
                    <button onClick={() => gerarReciboPDF(s, store, store.clients)} style={{ color: MUTED }} className="font-medium">
                      PDF
                    </button>
                    {canVoid && s.status !== "void" && (
                      <button onClick={() => setVoidTarget(s.id)} style={{ color: BRICK }} className="font-medium">
                        Cancelar
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sm:col-span-3">
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-semibold">Venda actual</div>
            {cart.length > 0 && (
              <button onClick={parkSale} style={{ color: MUTED }} className="text-xs flex items-center gap-1">
                <PauseCircle size={13} /> Colocar em espera
              </button>
            )}
          </div>
          <div className="space-y-2.5 overflow-auto" style={{ maxHeight: "45vh" }}>
            {cart.length === 0 && (
              <div className="text-xs" style={{ color: MUTED }}>
                Toque num produto para adicionar.
              </div>
            )}
            {cart.map((l) => (
              <div key={l.lineId} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="truncate">{l.name}</div>
                  <div style={{ color: MUTED }} className="text-xs">
                    {fmtMT(l.price)} × {l.qty}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(l.lineId, l.qty - (l.unit === "un" ? 1 : 0.5))} style={{ borderColor: BORDER }} className="border rounded p-1">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs">{l.qty}</span>
                  <button onClick={() => updateQty(l.lineId, l.qty + (l.unit === "un" ? 1 : 0.5))} style={{ borderColor: BORDER }} className="border rounded p-1">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeLine(l.lineId)} className="ml-1">
                    <Trash2 size={13} style={{ color: BRICK }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}` }} className="pt-2 mt-2">
            <CheckoutPanel items={cart} clients={store.clients} canDiscount={canDiscount} onConfirm={handleConfirm} paymentMethods={paymentMethods} ivaConfig={store.config.iva} config={store.config} />
          </div>
        </div>
      </div>

      {variantPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setVariantPicker(null)}>
          <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Escolha a variante — {variantPicker.name}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {variantPicker.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock <= 0}
                  onClick={() => addToCart(variantPicker, v)}
                  style={{ borderColor: BORDER, opacity: v.stock <= 0 ? 0.4 : 1 }}
                  className="border rounded p-2 text-xs text-center"
                >
                  <div className="font-medium">{v.label}</div>
                  <div style={{ color: MUTED }}>{v.stock} un</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showParked && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowParked(false)}>
          <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Vendas em espera</div>
            <div className="space-y-1.5">
              {store.parkedSales.map((p) => (
                <button key={p.id} onClick={() => resumeSale(p)} style={{ borderColor: BORDER }} className="w-full border rounded px-3 py-2 text-sm text-left flex justify-between">
                  <span>{p.cart.length} item(ns)</span>
                  <span style={{ color: MUTED }} className="text-xs">
                    {new Date(p.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {voidTarget && (
        <VoidModal
          onConfirm={(reason) => {
            voidSale(voidTarget, reason);
            setVoidTarget(null);
          }}
          onClose={() => setVoidTarget(null)}
        />
      )}
    </div>
  );
}
