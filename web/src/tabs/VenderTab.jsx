import { useEffect, useMemo, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GOLD, BRICK, SOFTGOLD } from "../lib/theme.js";
import { fmtMT, getStock, uid } from "../lib/utils.js";
import { ProductCard, CheckoutPanel } from "../components/Shared.jsx";
import { Minus, Plus, Trash2, PlayCircle } from "../lib/icons.jsx";
import BarcodeScanner from "../components/BarcodeScanner.jsx";
import { imprimirCotacao } from "../lib/print.js";

export default function VenderTab({ store, setStore, api, finalizeSale, voidSale, shiftOpen, canDiscount, canVoid, showToast, paymentMethods, restauranteAtivo }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [variantPicker, setVariantPicker] = useState(null);
  const [showParked, setShowParked] = useState(false);
  const [showCotacoes, setShowCotacoes] = useState(false);
  const [vendaRapida, setVendaRapida] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const onScan = (code) => {
    setShowScanner(false);
    const found = store.products.find((p) => (p.codigo || "").toLowerCase() === String(code).toLowerCase());
    if (found) {
      addToCart(found);
      showToast(found.name + " adicionado");
    } else {
      showToast("Código não encontrado: " + code, "warn");
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      store.products.filter(
        (p) => p.active !== false && p.vendaDirecta !== false && (p.name.toLowerCase().includes(q) || (p.codigo || "").toLowerCase().includes(q))
      ),
    [store.products, q]
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

  // Botão direito do rato sobre um produto: diminui 1 unidade do carrinho
  // (o botão esquerdo adiciona). Age sobre a última linha desse produto.
  const diminuirDoCarrinho = (p) => {
    setCart((c) => {
      let idx = -1;
      for (let i = c.length - 1; i >= 0; i--) {
        if (c[i].productId === p.id) { idx = i; break; }
      }
      if (idx === -1) return c;
      const passo = p.unit === "un" ? 1 : 0.5;
      return c.map((x, i) => (i === idx ? { ...x, qty: x.qty - passo } : x)).filter((x) => x.qty > 0);
    });
  };
  const onProdutoContexto = (e, p) => {
    e.preventDefault();
    if (!vendaRapida) diminuirDoCarrinho(p);
  };
  const diminuirPorToque = (p) => {
    if (!vendaRapida) diminuirDoCarrinho(p);
  };
  // Handlers de toque prolongado + botão direito para os botões "mais vendidos"
  // (que não são ProductCard). Mantém o dedo ~0,45 s para diminuir. O `handled`
  // evita diminuir a dobrar quando o Android dispara o menu de contexto além do
  // temporizador.
  const toqueProlongado = (p) => {
    let t = null;
    let handled = false;
    let fired = false;
    const diminuir = () => {
      if (handled) return;
      handled = true;
      fired = true;
      diminuirPorToque(p);
    };
    return {
      onTouchStart: () => {
        handled = false;
        fired = false;
        t = setTimeout(diminuir, 450);
      },
      onTouchEnd: () => t && clearTimeout(t),
      onTouchMove: () => t && clearTimeout(t),
      onContextMenu: (e) => {
        e.preventDefault();
        if (t) clearTimeout(t);
        diminuir();
      },
      onClickCapture: (e) => {
        if (fired) {
          fired = false;
          e.preventDefault();
          e.stopPropagation();
        }
      },
    };
  };

  const parkSale = async () => {
    if (cart.length === 0) return;
    const next = await api.parkSale(cart);
    setStore(next);
    setCart([]);
    showToast("Venda colocada em espera");
  };
  const guardarEmMesa = async (tableId) => {
    if (cart.length === 0) return;
    let next = store;
    if (!store.comandas.find((c) => c.tableId === tableId)) {
      next = await api.openComanda(tableId);
      setStore(next);
    }
    const comanda = next.comandas.find((c) => c.tableId === tableId);
    const merged = (comanda?.items || []).map((it) => ({ ...it }));
    for (const l of cart) {
      const found = merged.find((it) => it.productId === l.productId && it.name === l.name);
      if (found) found.qty += l.qty;
      else merged.push({ productId: l.productId, name: l.name, price: l.price, cost: l.cost, qty: l.qty });
    }
    setStore(await api.setComandaItems(tableId, merged));
    setCart([]);
    const mesa = store.tables.find((t) => t.id === tableId);
    showToast("Pedido guardado em " + (mesa ? mesa.label : "mesa"));
  };

  const gerarCotacao = async ({ items, total, discount, clientId, ivaTaxa }) => {
    if (!items || items.length === 0) return;
    const payloadItems = items.map((l) => ({ productId: l.productId, variantId: l.variantId || null, name: l.name, qty: l.qty, price: l.price, cost: l.cost || 0 }));
    const next = await api.createQuotation({ items: payloadItems, total, discount, clientId, ivaTaxa });
    setStore(next);
    const cot = (next.cotacoes || [])[0];
    if (cot) imprimirCotacao(cot, next, next.clients);
    showToast("Cotação gerada" + (cot ? " (" + cot.numero + ")" : ""));
  };

  const carregarCotacao = (cot) => {
    setCart(
      cot.items.map((it) => ({
        lineId: (it.productId || "x") + uid(),
        productId: it.productId,
        variantId: it.variantId || null,
        name: it.name,
        price: it.price,
        cost: it.cost || 0,
        unit: "un",
        qty: it.qty,
      }))
    );
    setShowCotacoes(false);
    showToast("Cotação carregada para a venda");
  };

  const apagarCotacao = async (id) => {
    setStore(await api.deleteQuotation(id));
  };

  const addClientInline = async ({ name, phone }) => {
    const prevIds = new Set(store.clients.map((c) => c.id));
    const next = await api.createClient({ name, phone });
    setStore(next);
    const created = next.clients.find((c) => !prevIds.has(c.id));
    showToast("Cliente adicionado");
    return created ? created.id : "";
  };
  const resumeSale = async (parked) => {
    setCart(parked.cart);
    const next = await api.resumeSale(parked.id);
    setStore(next);
    setShowParked(false);
  };

  const handleConfirm = async ({ total, discount, payments, clientId, pontosUsados, ivaTaxa }) => {
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
      ivaTaxa,
    });
    setCart([]);
  };

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
        const btn = document.getElementById("pdv-finalizar-venda");
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
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
          />
          <button onClick={() => setShowScanner(true)} style={{ borderColor: BORDER, color: TEAL, background: CARD }} className="border rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap">
            📷 Ler código
          </button>
          <button onClick={() => setVendaRapida((v) => !v)} style={{ borderColor: vendaRapida ? GOLD : BORDER, color: vendaRapida ? GOLD : MUTED, background: vendaRapida ? SOFTGOLD : CARD }} className="border rounded-lg px-2.5 py-2 text-xs font-medium whitespace-nowrap">
            Venda rápida
          </button>
          {store.parkedSales.length > 0 && (
            <button onClick={() => setShowParked(true)} style={{ borderColor: BORDER, color: TEAL }} className="border rounded-lg px-2.5 py-2 text-xs flex items-center gap-1">
              <PlayCircle size={13} /> {store.parkedSales.length} em espera
            </button>
          )}
          {(store.cotacoes || []).length > 0 && (
            <button onClick={() => setShowCotacoes(true)} style={{ borderColor: BORDER, color: TEAL }} className="border rounded-lg px-2.5 py-2 text-xs whitespace-nowrap">
              {store.cotacoes.length} cotações
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
                  {...toqueProlongado(p)}
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
            <ProductCard key={p.id} p={p} compact produtos={store.products} disabled={getStock(p, store.products) <= 0} onClick={() => (vendaRapida ? vendaImediata(p) : addToCart(p))} onContextMenu={(e) => onProdutoContexto(e, p)} onLongPress={() => diminuirPorToque(p)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm" style={{ color: MUTED }}>
              Nenhum produto encontrado.
            </div>
          )}
        </div>

      </div>

      <div className="sm:col-span-3">
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-semibold">Venda actual</div>
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
                  <button onClick={() => updateQty(l.lineId, l.qty - (l.unit === "un" ? 1 : 0.5))} style={{ borderColor: BORDER }} className="border rounded-lg p-1">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs">{l.qty}</span>
                  <button onClick={() => updateQty(l.lineId, l.qty + (l.unit === "un" ? 1 : 0.5))} style={{ borderColor: BORDER }} className="border rounded-lg p-1">
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
            <CheckoutPanel items={cart} clients={store.clients} canDiscount={canDiscount} onConfirm={handleConfirm} onPark={parkSale} onAddClient={addClientInline} onQuote={gerarCotacao} mesas={restauranteAtivo ? store.tables : null} onGuardarMesa={guardarEmMesa} paymentMethods={paymentMethods} ivaConfig={store.config.iva} config={store.config} />
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
                  className="border rounded-lg p-2 text-xs text-center"
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
                <button key={p.id} onClick={() => resumeSale(p)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-3 py-2 text-sm text-left flex justify-between">
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

      {showCotacoes && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCotacoes(false)}>
          <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Cotações / orçamentos</div>
            <div className="space-y-1.5 max-h-[60vh] overflow-auto">
              {(store.cotacoes || []).length === 0 && (
                <div className="text-xs" style={{ color: MUTED }}>Ainda não há cotações.</div>
              )}
              {(store.cotacoes || []).map((c) => {
                const cli = store.clients.find((x) => x.id === c.clientId);
                return (
                  <div key={c.id} style={{ borderColor: BORDER }} className="border rounded-lg px-3 py-2 text-sm">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{c.numero}</div>
                      <div style={{ color: TEAL }} className="font-semibold">{fmtMT(c.total)}</div>
                    </div>
                    <div className="text-xs" style={{ color: MUTED }}>
                      {c.items.length} item(ns) · {cli ? cli.name : "Consumidor Final"} · {new Date(c.date).toLocaleDateString("pt-PT")}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => carregarCotacao(c)} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded-lg py-1.5 text-xs font-medium">
                        Carregar para venda
                      </button>
                      <button onClick={() => imprimirCotacao(c, store, store.clients)} style={{ borderColor: BORDER, color: INK }} className="border rounded-lg px-2.5 py-1.5 text-xs">
                        Imprimir
                      </button>
                      <button onClick={() => apagarCotacao(c.id)} style={{ borderColor: BORDER, color: BRICK }} className="border rounded-lg px-2.5 py-1.5 text-xs">
                        Apagar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showScanner && <BarcodeScanner onDetected={onScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}
