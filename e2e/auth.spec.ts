import { test, expect } from "@playwright/test";

function uniqueEmail() {
  return `libreta-e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("registro, logout y login de punta a punta", async ({ page }) => {
  const email = uniqueEmail();
  const password = "Test1234!";

  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Laura de prueba");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("button", { name: "+ Nuevo pedido" })).toBeVisible();

  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL(/\/app\/login$/);

  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("link", { name: "Resumen" })).toBeVisible();
});
