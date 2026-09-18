import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, GOLD, BRICK, GREEN, SOFTGOLD } from "../lib/theme.js";
import { fmtMT, getStock } from "../lib/utils.js";
import { ProductCard, CheckoutPanel } from "../components/Shared.jsx";
import { ChevronLeft, Minus, Plus } from "../lib/icons.jsx";

export default function MesasTab({ store, setStore, api, finalizeSale, shiftOpen, canDiscount, showToast, paymentMethods }) {
  const [openTableId, setOpenTableId] = useState(null);
  const [query, setQuery] = useState("");

  const comandaOf = (tableId) => store.comandas.find((c) => c.tableId === tableId);

  const openTable = async (tableId) => {
    if (!comandaOf(tableId)) {
      setStore(await api.openComanda(tableId));
    }
    setOpenTableId(tableId);
  };

  const addItem = async (tableId, p) => {
    const comanda = comandaOf(tableId);
    if (!comanda || getStock(p, store.products) <= 0) return;
    const existing = comanda.items.find((it) => it.productId === p.id);
    const nextItems = existing
      ? comanda.items.map((it) => (it.productId === p.id ? { ...it, qty: it.qty + 1 } : it))
      : [...comanda.items, { productId: p.id, name: p.name, price: p.price, cost: p.cost, qty: 1 }];
    setStore(await api.setComandaItems(tableId, nextItems));
  };

  const changeItemQty = async (tableId, productId, delta) => {
    const comanda = comandaOf(tableId);
    const nextItems = comanda.items.map((it) => (it.productId === productId ? { ...it, qty: Math.max(0, it.qty + delta) } : it)).filter((it) => it.qty > 0);
    setStore(await api.setComandaItems(tableId, nextItems));
  };

  const cancelComanda = async (tableId) => {
    setStore(await api.cancelComanda(tableId));
    setOpenTableId(null);
  };

  const closeComanda = async ({ total, discount, payments, clientId }) => {
    if (!shiftOpen) {
      showToast("Abra o caixa antes de fechar contas", "warn");
      return;
    }
    const comanda = comandaOf(openTableId);
    await finalizeSale({
      items: comanda.items.map((it) => ({ productId: it.productId, name: it.name, qty: it.qty, price: it.price, cost: it.cost })),
      total,
      discount,
      payments,
      clientId,
      tableId: openTableId,
    });
    setOpenTableId(null);
  };

  const filtered = store.products.filter((p) => p.active !== false && p.name.toLowerCase().includes(query.toLowerCase()));
  const openComanda = openTableId ? comandaOf(openTableId) : null;

  if (openTableId && openComanda) {
    const table = store.tables.find((t) => t.id === openTableId);
    return (
      <div>
        <button onClick={() => setOpenTableId(null)} style={{ color: TEAL }} className="text-sm font-medium mb-3 flex items-center gap-1">
          <ChevronLeft size={15} /> Voltar às mesas
        </button>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar produto…"
              style={{ borderColor: BORDER, background: CARD }}
              className="w-full border rounded px-3 py-2 text-sm mb-3"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} produtos={store.products} disabled={getStock(p, store.products) <= 0} onClick={() => addItem(openTableId, p)} />
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">{table?.label} — comanda</div>
              <div className="space-y-2 mb-2 max-h-52 overflow-auto">
                {openComanda.items.length === 0 && (
                  <div className="text-xs" style={{ color: MUTED }}>
                    Sem itens ainda.
                  </div>
                )}
                {openComanda.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0 truncate">{it.name}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => changeItemQty(openTableId, it.productId, -1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs">{it.qty}</span>
                      <button onClick={() => changeItemQty(openTableId, it.productId, 1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => cancelComanda(openTableId)} style={{ color: BRICK }} className="text-xs font-medium mb-3">
                Cancelar comanda
              </button>
              <div style={{ borderTop: `1px solid ${BORDER}` }} className="pt-2">
                <CheckoutPanel
                  items={openComanda.items}
                  extraChargePct={openComanda.serviceChargePct}
                  clients={store.clients}
                  canDiscount={canDiscount}
                  onConfirm={closeComanda}
                  label="Total da mesa"
                  paymentMethods={paymentMethods}
                  ivaConfig={store.config.iva}
                  config={store.config}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addMesa = async () => {
    const n = store.tables.length + 1;
    setStore(await api.addTable("Mesa " + n));
  };
  const removeMesa = async (id) => {
    if (comandaOf(id)) return;
    setStore(await api.removeTable(id));
  };
  const renameMesa = async (id) => {
    const t = store.tables.find((x) => x.id === id);
    const nome = prompt("Nome da mesa", t ? t.label : "");
    if (nome && nome.trim()) setStore(await api.renameTable(id, nome.trim()));
  };
  const ocupadas = store.tables.filter((t) => comandaOf(t.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-base font-semibold">
          Mesas <span className="text-xs font-normal" style={{ color: MUTED }}>({ocupadas} ocupadas de {store.tables.length})</span>
        </div>
        <div className="flex gap-2">
          <button onClick={addMesa} style={{ background: GREEN, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1">
            <Plus size={13} /> Adicionar mesa
          </button>
          <button
            onClick={() => {
              const livres = store.tables.filter((t) => !comandaOf(t.id));
              if (livres.length) removeMesa(livres[livres.length - 1].id);
            }}
            disabled={store.tables.every((t) => comandaOf(t.id))}
            style={{ background: BRICK, color: "#fff" }}
            className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1 disabled:opacity-40"
          >
            <Minus size={13} /> Remover mesa livre
          </button>
        </div>
      </div>
      <div className="text-xs" style={{ color: MUTED }}>
        Toque longo não é preciso: use "Renomear" em cada mesa. Mesas ocupadas não podem ser removidas.
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {store.tables.map((t) => {
          const comanda = comandaOf(t.id);
          const total = comanda ? comanda.items.reduce((s, it) => s + it.price * it.qty, 0) : 0;
          return (
            <div key={t.id} style={{ background: comanda ? SOFTGOLD : CARD, borderColor: comanda ? GOLD : BORDER }} className="border rounded-lg p-3 text-center relative">
              <button onClick={() => openTable(t.id)} className="w-full">
                <div className="text-sm font-semibold">{t.label}</div>
                <div style={{ color: comanda ? GOLD : MUTED }} className="text-xs mt-1">
                  {comanda ? `Ocupada · ${fmtMT(total)}` : "Livre"}
                </div>
              </button>
              <div className="flex justify-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid " + BORDER }}>
                <button onClick={() => renameMesa(t.id)} style={{ color: TEAL }} className="text-[10px] font-medium">
                  Renomear
                </button>
                {!comanda && (
                  <button onClick={() => removeMesa(t.id)} style={{ color: BRICK }} className="text-[10px] font-medium">
                    Remover
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
