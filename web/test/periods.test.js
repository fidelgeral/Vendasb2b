import test from "node:test";
import assert from "node:assert/strict";
import { inPeriod, periodoAnterior, variacao } from "../src/lib/periods.js";

test("inPeriod respeita os limites (inclusivo)", () => {
  assert.equal(inPeriod("2026-10-10T08:00:00Z", "2026-10-01", "2026-10-31"), true);
  assert.equal(inPeriod("2026-10-01", "2026-10-01", "2026-10-31"), true);
  assert.equal(inPeriod("2026-10-31", "2026-10-01", "2026-10-31"), true);
  assert.equal(inPeriod("2026-09-30", "2026-10-01", "2026-10-31"), false);
  assert.equal(inPeriod("2026-11-01", "2026-10-01", "2026-10-31"), false);
  assert.equal(inPeriod("2026-10-10", "", ""), true);
});

test("periodoAnterior é a janela de igual duração imediatamente antes", () => {
  const p = periodoAnterior("2026-10-08", "2026-10-14"); // 7 dias
  assert.equal(p.to, "2026-10-07");
  assert.equal(p.from, "2026-10-01");
});

test("periodoAnterior de 1 dia", () => {
  const p = periodoAnterior("2026-10-10", "2026-10-10");
  assert.equal(p.from, "2026-10-09");
  assert.equal(p.to, "2026-10-09");
});

test("periodoAnterior é null quando não há data inicial", () => {
  assert.equal(periodoAnterior("", "2026-10-14"), null);
  assert.equal(periodoAnterior(null, null), null);
});

test("variacao formata com sinal e trata base zero", () => {
  assert.equal(variacao(110, 100), "+10.0%");
  assert.equal(variacao(80, 100), "-20.0%");
  assert.equal(variacao(50, 0), "—");
  assert.equal(variacao(100, 100), "+0.0%");
});
