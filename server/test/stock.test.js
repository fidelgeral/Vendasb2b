import test from "node:test";
import assert from "node:assert/strict";
import { decrementStock } from "../src/routes/caixa.js";

// Cliente de BD simulado: responde aos SELECT com dados preparados e regista
// todas as queries para podermos verificar os UPDATE emitidos.
function mockClient(products, { combos = {}, batches = {} } = {}) {
  const calls = [];
  return {
    calls,
    async query(text, params) {
      calls.push({ text, params });
      if (/SELECT \* FROM products WHERE id = \$1/.test(text)) {
        const p = products[params[0]];
        return { rows: p ? [p] : [] };
      }
      if (/FROM product_combo_items/.test(text)) return { rows: combos[params[0]] || [] };
      if (/FROM product_batches/.test(text)) return { rows: batches[params[0]] || [] };
      return { rows: [] };
    },
  };
}
const updates = (client, re) => client.calls.filter((c) => re.test(c.text)).map((c) => c.params);

test("decrementStock: produto simples sem lotes baixa products.stock", async () => {
  const client = mockClient({ p: { id: "p", tipo: "simples" } });
  await decrementStock(client, "p", null, 4);
  assert.deepEqual(updates(client, /UPDATE products SET stock = GREATEST/), [[4, "p"]]);
});

test("decrementStock: variante baixa o stock da variante", async () => {
  const client = mockClient({ p: { id: "p", tipo: "simples" } });
  await decrementStock(client, "p", "v1", 2);
  assert.deepEqual(updates(client, /UPDATE product_variants/), [[2, "v1"]]);
});

test("decrementStock: variação puxa do pai (qty × consumo)", async () => {
  const client = mockClient({
    child: { id: "child", tipo: "variacao", parent_id: "parent", consumo: 3 },
    parent: { id: "parent", tipo: "simples" },
  });
  await decrementStock(client, "child", null, 2);
  assert.deepEqual(updates(client, /UPDATE products SET stock = GREATEST/), [[6, "parent"]]); // 2×3
});

test("decrementStock: composição baixa cada ingrediente (qty × quantidade)", async () => {
  const client = mockClient(
    { combo: { id: "combo", tipo: "composicao" }, a: { id: "a", tipo: "simples" }, b: { id: "b", tipo: "simples" } },
    { combos: { combo: [{ ingredient_product_id: "a", qty: 2 }, { ingredient_product_id: "b", qty: 1 }] } }
  );
  await decrementStock(client, "combo", null, 3);
  assert.deepEqual(updates(client, /UPDATE products SET stock = GREATEST/), [[6, "a"], [3, "b"]]); // 3×2, 3×1
});

test("decrementStock: lotes são consumidos FEFO (mais perto de vencer primeiro)", async () => {
  const client = mockClient(
    { p: { id: "p", tipo: "simples", business_id: "b" } },
    { batches: { p: [{ id: "ba", qty: 3, expiry_date: "2026-01-01" }, { id: "bb", qty: 5, expiry_date: "2026-02-01" }] } }
  );
  await decrementStock(client, "p", null, 4);
  // Tira 3 do lote que vence primeiro e 1 do seguinte.
  assert.deepEqual(updates(client, /UPDATE product_batches SET qty = qty - /), [[3, "ba"], [1, "bb"]]);
});

test("decrementStock: produto inexistente não faz nada", async () => {
  const client = mockClient({});
  await decrementStock(client, "naoexiste", null, 5);
  assert.equal(updates(client, /UPDATE/).length, 0);
});
