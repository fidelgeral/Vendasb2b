import test from "node:test";
import assert from "node:assert/strict";
import { temPermissao } from "../src/permissions.js";

test("dono pode sempre tudo", () => {
  assert.equal(temPermissao("dono", {}, "produtoApagar"), true);
  assert.equal(temPermissao("dono", { produtoApagar: false }, "produtoApagar"), true); // dono ignora overrides
  assert.equal(temPermissao("dono", {}, "gerirEquipa"), true);
});

test("gerente faz quase tudo, menos gerir equipa (por omissão)", () => {
  assert.equal(temPermissao("gerente", {}, "produtoApagar"), true);
  assert.equal(temPermissao("gerente", {}, "verBalanco"), true);
  assert.equal(temPermissao("gerente", {}, "gerirEquipa"), false);
});

test("caixa só tem o conjunto operacional por omissão", () => {
  assert.equal(temPermissao("caixa", {}, "vender"), true);
  assert.equal(temPermissao("caixa", {}, "caixaAbrirFechar"), true);
  assert.equal(temPermissao("caixa", {}, "fiadoReceber"), true);
  assert.equal(temPermissao("caixa", {}, "produtoApagar"), false);
  assert.equal(temPermissao("caixa", {}, "verBalanco"), false);
  assert.equal(temPermissao("caixa", {}, "gerirConfig"), false);
});

test("a permissão guardada à mão tem prioridade sobre o padrão do papel", () => {
  // conceder uma extra ao caixa
  assert.equal(temPermissao("caixa", { produtoApagar: true }, "produtoApagar"), true);
  // retirar uma que o papel teria
  assert.equal(temPermissao("caixa", { vender: false }, "vender"), false);
});

test("papel desconhecido não tem permissões por omissão", () => {
  assert.equal(temPermissao("outro", {}, "vender"), false);
  assert.equal(temPermissao("cozinha", {}, "vender"), false);
  assert.equal(temPermissao("cozinha", {}, "verMovimentos"), true);
});
