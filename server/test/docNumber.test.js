import test from "node:test";
import assert from "node:assert/strict";
import { nextDocNumber } from "../src/docNumber.js";

const ano = new Date().getFullYear();

test("numera com a série do ano actual e incrementa", () => {
  const r = nextDocNumber({ docSeries: { prefixo: "FT", ano, proximo: 7 } });
  assert.equal(r.numero, `FT${ano}/0007`);
  assert.deepEqual(r.nextSeries, { prefixo: "FT", ano, proximo: 8 });
});

test("recomeça em 1 quando a série é de um ano anterior", () => {
  const r = nextDocNumber({ docSeries: { prefixo: "FT", ano: ano - 1, proximo: 50 } });
  assert.equal(r.numero, `FT${ano}/0001`);
  assert.equal(r.nextSeries.proximo, 2);
});

test("usa prefixo e padding de 4 dígitos por omissão", () => {
  const r = nextDocNumber({});
  assert.match(r.numero, /^FT\d{4}\/0001$/);
});

test("respeita um prefixo personalizado", () => {
  const r = nextDocNumber({ docSeries: { prefixo: "REC", ano, proximo: 123 } });
  assert.equal(r.numero, `REC${ano}/0123`);
});
