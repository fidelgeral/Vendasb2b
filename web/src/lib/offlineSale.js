// Aplica uma venda offline ao "store" em memória, para o ecrã reflectir a venda
// de imediato (contagem, totais e stock). Quando a ligação volta e o "store" é
// recarregado do servidor, estes valores são substituídos pelos reais.

function decrementProductStock(products, item) {
  return products.map((p) => {
    if (p.id !== item.productId) return p;
    if (item.variantId && p.variants && p.variants.length) {
      return {
        ...p,
        variants: p.variants.map((v) =>
          v.id === item.variantId ? { ...v, stock: Math.max(0, (v.stock || 0) - item.qty) } : v
        ),
      };
    }
    if (p.batches && p.batches.length) {
      let resto = item.qty;
      const batches = p.batches.map((b) => {
        if (resto <= 0) return b;
        const take = Math.min(b.qty, resto);
        resto -= take;
        return { ...b, qty: b.qty - take };
      });
      return { ...p, batches };
    }
    return { ...p, stock: Math.max(0, (p.stock || 0) - item.qty) };
  });
}

export function applyOfflineSale(store, payload, meta = {}) {
  if (!store) return store;
  let products = store.products || [];
  for (const it of payload.items) {
    products = decrementProductStock(products, it);
  }
  const sale = {
    id: meta.localId,
    numero: "Offline",
    date: new Date().toISOString(),
    total: payload.total,
    discount: payload.discount || 0,
    payments: payload.payments || [],
    clientId: payload.clientId || null,
    employeeId: null,
    employeeName: meta.employeeName || "",
    shiftId: null,
    tableId: payload.tableId || null,
    status: "completed",
    voidReason: null,
    pontosUsados: payload.pontosUsados || 0,
    pontosGanhos: 0,
    items: payload.items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId || null,
      name: it.name,
      qty: it.qty,
      price: it.price,
      cost: it.cost || 0,
    })),
    _offline: true,
  };
  return { ...store, products, sales: [sale, ...(store.sales || [])] };
}
