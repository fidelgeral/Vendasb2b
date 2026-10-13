import test from "node:test";
import assert from "node:assert/strict";
import { signToken, verifyToken } from "../src/auth/jwt.js";
import { hashPassword, verifyPassword } from "../src/auth/hash.js";

test("JWT: assina e verifica (round-trip)", () => {
  const token = signToken({ type: "employee", businessId: "b1", role: "dono" });
  const payload = verifyToken(token);
  assert.equal(payload.type, "employee");
  assert.equal(payload.businessId, "b1");
  assert.equal(payload.role, "dono");
});

test("JWT: rejeita um token adulterado", () => {
  const token = signToken({ a: 1 });
  assert.throws(() => verifyToken(token + "x"));
});

test("JWT: rejeita um token expirado", () => {
  const token = signToken({ a: 1 }, "-1s");
  assert.throws(() => verifyToken(token));
});

test("hash: verifica a senha correcta e rejeita a errada", async () => {
  const h = await hashPassword("segredo123");
  assert.ok(h && h !== "segredo123");
  assert.equal(await verifyPassword("segredo123", h), true);
  assert.equal(await verifyPassword("errada", h), false);
});

test("hash: verifyPassword sem hash devolve false", async () => {
  assert.equal(await verifyPassword("x", null), false);
  assert.equal(await verifyPassword("x", ""), false);
});
