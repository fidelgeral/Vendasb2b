import test from "node:test";
import assert from "node:assert/strict";
import { fmtMT, ownStock, getStock, isLowStock, nearExpiry, daysUntil, mapImportRow, todayStr } from "../src/lib/utils.js";

// ---------------- fmtMT ----------------
test("fmtMT arredonda e acrescenta 'MT'", () => {
  assert.equal(fmtMT(50), "50 MT");
  assert.equal(fmtMT(50.4), "50 MT");
  assert.equal(fmtMT(50.6), "51 MT");
  assert.equal(fmtMT(0), "0 MT");
  assert.equal(fmtMT(null), "0 MT");
  assert.equal(fmtMT(undefined), "0 MT");
});

// ---------------- ownStock ----------------
test("ownStock: stock simples, variantes e lotes", () => {
  assert.equal(ownStock({ stock: 7 }), 7);
  assert.equal(ownStock({ variants: [{ stock: 3 }, { stock: 2 }] }), 5);
  assert.equal(ownStock({ batches: [{ qty: 4 }, { qty: 1 }] }), 5);
  assert.equal(ownStock(null), 0);
  assert.equal(ownStock({}), 0);
});

// ---------------- getStock ----------------
test("getStock: produto simples", () => {
  assert.equal(getStock({ stock: 9 }), 9);
});

test("getStock: variação puxa do pai dividido pelo consumo", () => {
  const pai = { id: "p", stock: 10 };
  const filho = { tipo: "variacao", parentId: "p", consumo: 2 };
  assert.equal(getStock(filho, [pai, filho]), 5); // floor(10/2)
});

test("getStock: variação sem pai → 0", () => {
  assert.equal(getStock({ tipo: "variacao", parentId: "x", consumo: 1 }, []), 0);
});

test("getStock: composição limitada pelo ingrediente mais escasso", () => {
  const a = { id: "a", stock: 10 };
  const b = { id: "b", stock: 3 };
  const combo = { tipo: "composicao", ingredientes: [{ productId: "a", qty: 2 }, { productId: "b", qty: 1 }] };
  assert.equal(getStock(combo, [a, b, combo]), 3); // min(floor(10/2)=5, floor(3/1)=3)
});

test("getStock: composição com ingrediente em falta → 0", () => {
  const combo = { tipo: "composicao", ingredientes: [{ productId: "naoexiste", qty: 1 }] };
  assert.equal(getStock(combo, []), 0);
});

// ---------------- isLowStock ----------------
test("isLowStock compara com o stock mínimo", () => {
  assert.equal(isLowStock({ stock: 2, minStock: 5 }), true);
  assert.equal(isLowStock({ stock: 10, minStock: 5 }), false);
  assert.equal(isLowStock({ stock: 5, minStock: 5 }), true); // <=
  assert.equal(isLowStock({ stock: 0 }), true); // minStock omitido = 0
  assert.equal(isLowStock({ stock: 1 }), false);
});

// ---------------- daysUntil / nearExpiry ----------------
const addDays = (n) => {
  const d = new Date(todayStr() + "T00:00:00");
  d.setDate(d.getDate() + n);
  // Usa as partes locais (não toISOString, que converteria para UTC e poderia
  // mudar o dia em fusos à frente de UTC).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

test("daysUntil: sem data → 999; datas relativas", () => {
  assert.equal(daysUntil(null), 999);
  assert.equal(daysUntil(todayStr()), 0);
  assert.equal(daysUntil(addDays(5)), 5);
  assert.equal(daysUntil(addDays(-2)), -2);
});

test("nearExpiry devolve lotes com stock a vencer dentro do prazo", () => {
  const p = {
    batches: [
      { qty: 4, expiryDate: addDays(1) }, // vence já
      { qty: 2, expiryDate: addDays(10) }, // longe
      { qty: 0, expiryDate: addDays(1) }, // sem stock → ignorado
    ],
  };
  const r = nearExpiry(p, 3);
  assert.equal(r.length, 1);
  assert.equal(r[0].qty, 4);
  assert.equal(nearExpiry({ stock: 5 }).length, 0); // sem lotes
});

// ---------------- mapImportRow ----------------
test("mapImportRow mapeia cabeçalhos PT (acentos/maiúsculas) para campos", () => {
  const r = mapImportRow({ "Nome": "Água", "Preço": "20", "Custo": "12", "Estoque": "8", "Categoria": "Bebidas", "Stock Mínimo": "3" });
  assert.equal(r.name, "Água");
  assert.equal(r.price, "20");
  assert.equal(r.cost, "12");
  assert.equal(r.stock, "8");
  assert.equal(r.category, "Bebidas");
  assert.equal(r.minStock, "3");
});

test("mapImportRow aceita sinónimos (produto/quantidade/preço de custo)", () => {
  const r = mapImportRow({ "produto": "X", "quantidade": "5", "preço de custo": "7" });
  assert.equal(r.name, "X");
  assert.equal(r.stock, "5");
  assert.equal(r.cost, "7");
});

test("mapImportRow ignora colunas desconhecidas", () => {
  const r = mapImportRow({ "coluna qualquer": "1", "Nome": "Y" });
  assert.deepEqual(Object.keys(r), ["name"]);
});
