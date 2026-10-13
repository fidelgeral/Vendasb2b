import test from "node:test";
import assert from "node:assert/strict";
import { code128SVG } from "../src/lib/barcode.js";

test("gera um SVG com barras e o número legível", () => {
  const svg = code128SVG("4589641235498", { height: 40 });
  assert.ok(svg.startsWith("<svg"), "começa com <svg");
  assert.ok(svg.includes("<rect"), "tem barras (rect)");
  assert.ok(svg.includes("4589641235498"), "mostra o número");
  assert.ok(svg.includes("</svg>"), "fecha o svg");
});

test("funciona com texto alfanumérico (subconjunto B)", () => {
  const svg = code128SVG("ABC-123");
  assert.ok(svg.includes("<rect"));
  assert.ok(svg.includes("ABC-123"));
});

test("código vazio devolve string vazia", () => {
  assert.equal(code128SVG(""), "");
  assert.equal(code128SVG(null), "");
});

test("showText=false não inclui o texto", () => {
  const svg = code128SVG("12345678", { showText: false });
  assert.ok(!svg.includes("<text"));
  assert.ok(svg.includes("<rect"));
});

test("moduleWidth maior produz um SVG mais largo", () => {
  const a = code128SVG("12345678", { moduleWidth: 1 });
  const b = code128SVG("12345678", { moduleWidth: 2 });
  const w = (s) => Number(s.match(/width="(\d+(?:\.\d+)?)"/)[1]);
  assert.ok(w(b) > w(a));
});
