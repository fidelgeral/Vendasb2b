import { test, expect } from "@playwright/test";

test("login e dashboard carrega", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=VENDASB2B")).toBeVisible({ timeout: 10000 });

  await page.fill('input[type="email"]', "maria@padaria.co.mz");
  await page.fill('input[type="password"]', "Fidel321");
  await page.click('button:has-text("Entrar")');

  await expect(page.locator("text=Dashboard")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("text=Vendas hoje")).toBeVisible();
  await expect(page.locator("text=Facturação")).toBeVisible();
});

test("atalhos de teclado funcionam", async ({ page }) => {
  await page.goto("/");
  await page.fill('input[type="email"]', "maria@padaria.co.mz");
  await page.fill('input[type="password"]', "Fidel321");
  await page.click('button:has-text("Entrar")');
  await expect(page.locator("text=Dashboard")).toBeVisible({ timeout: 15000 });

  await page.keyboard.press("F2");
  await expect(page.locator("text=Adicionar produto")).toBeVisible({ timeout: 5000 });

  await page.keyboard.press("Escape");
  await expect(page.locator("text=Dashboard")).toBeVisible({ timeout: 5000 });
});
