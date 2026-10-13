import test from "node:test";
import assert from "node:assert/strict";
import { computeIva } from "../src/lib/iva.js";

const close = (a, b) => Math.abs(a - b) < 0.01;

test("decompõe o total em base + IVA (16%)", () => {
  const r = computeIva(116, { taxa: 16, precosIncluemIva: true });
  assert.ok(close(r.base, 100), "base ~100");
  assert.ok(close(r.valor, 16), "IVA ~16");
  assert.equal(r.taxa, 16);
});

test("negócio isento → taxa 0 e IVA 0", () => {
  const r = computeIva(100, { taxa: 16, isento: true });
  assert.equal(r.taxa, 0);
  assert.equal(r.valor, 0);
  assert.equal(r.base, 100);
});

test("usa a taxa da venda em vez da taxa padrão do config", () => {
  const r = computeIva(105, { taxa: 16 }, 5);
  assert.equal(r.taxa, 5);
  assert.ok(close(r.base, 100));
  assert.ok(close(r.valor, 5));
});

test("base + IVA = total (igual com ou sem precosIncluemIva)", () => {
  for (const inc of [true, false]) {
    const r = computeIva(232, { taxa: 16, precosIncluemIva: inc });
    assert.ok(close(r.base + r.valor, 232), "soma = total para precosIncluemIva=" + inc);
  }
});

test("taxa 0 → base = total e IVA 0", () => {
  const r = computeIva(50, { taxa: 0 });
  assert.equal(r.base, 50);
  assert.equal(r.valor, 0);
});
