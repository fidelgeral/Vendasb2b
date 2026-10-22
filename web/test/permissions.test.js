import test from "node:test";
import assert from "node:assert/strict";
import { temPermissao, PERMISSOES, TODAS_PERMISSOES } from "../src/lib/permissions.js";

test("dono (Administrador do negócio) pode sempre tudo", () => {
  for (const id of TODAS_PERMISSOES) assert.equal(temPermissao({ role: "dono" }, id), true);
});

test("caixa: conjunto operacional, sem apagar produto nem relatórios", () => {
  const caixa = { role: "caixa", permissions: {} };
  assert.equal(temPermissao(caixa, "vender"), true);
  assert.equal(temPermissao(caixa, "fiadoReceber"), true);
  assert.equal(temPermissao(caixa, "produtoApagar"), false);
  assert.equal(temPermissao(caixa, "verBalanco"), false);
});

test("permissão explícita sobrepõe-se ao padrão", () => {
  assert.equal(temPermissao({ role: "caixa", permissions: { verBalanco: true } }, "verBalanco"), true);
  assert.equal(temPermissao({ role: "gerente", permissions: { produtoApagar: false } }, "produtoApagar"), false);
});

test("sem funcionário → sem permissão", () => {
  assert.equal(temPermissao(null, "vender"), false);
  assert.equal(temPermissao(undefined, "vender"), false);
});

test("a definição de permissões está coerente (ids únicos, com grupos)", () => {
  assert.ok(PERMISSOES.length >= 4);
  const ids = TODAS_PERMISSOES;
  assert.equal(ids.length, new Set(ids).size, "ids de permissão devem ser únicos");
  assert.ok(ids.includes("vender") && ids.includes("gerirConfig"));
});
