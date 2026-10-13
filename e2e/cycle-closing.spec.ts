import { test, expect } from "@playwright/test";
import { createCycle } from "./helpers";

function uniqueEmail() {
  return `libreta-e2e-closing-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("gasto baja el resultado, cerrar ciclo, crear el siguiente y volver a mirar el cerrado", async ({
  page,
}) => {
  // Muchos pasos seguidos, cada uno con su propio ida y vuelta al servidor:
  // el timeout default de 30s queda justo.
  test.setTimeout(90_000);

  const email = uniqueEmail();
  const password = "Test1234!";

  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Vendedora cierre");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();
  await expect(page).toHaveURL(/\/app$/);

  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo a cerrar");

  // pedido de $10.000, sin cobrar
  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await expect(page.getByRole("dialog", { name: "Nuevo pedido" })).toBeVisible({ timeout: 20000 });
  await page.getByLabel("Clienta").selectOption({ label: "+ Nueva clienta" });
  await page.getByPlaceholder("Nombre de la nueva clienta").fill("Deudora cierre");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByLabel("Clienta")).toHaveValue(/.+/, { timeout: 20000 });
  await page.getByPlaceholder("Producto").fill("Producto");
  await page.getByLabel("Cantidad").fill("1");
  await page.getByLabel("Precio").fill("10000");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/, { timeout: 20000 });

  // entro al ciclo desde Ajustes: Resultado = 10.000 (sin gastos)
  await page.getByRole("link", { name: "Ajustes" }).click();
  await page.getByRole("link", { name: /Ciclo a cerrar/ }).click();
  await expect(page).toHaveURL(/\/app\/cycles\/.+/, { timeout: 20000 });
  await expect(page.getByText("Resultado")).toBeVisible();
  await expect(page.getByText("$ 10.000").first()).toBeVisible();

  // cargo $8.000 de envío
  await page.getByRole("link", { name: "Ver gastos" }).click();
  await expect(page).toHaveURL(/\/app\/expenses$/, { timeout: 20000 });
  await page.locator('select[name="category"]').selectOption({ label: "Envío" });
  await page.getByPlaceholder("Monto").fill("8000");
  await page.getByRole("button", { name: "+ Registrar gasto" }).click();
  await expect(page.getByText("$ 8.000").first()).toBeVisible({ timeout: 20000 });

  // vuelvo al ciclo: el resultado bajó a 2.000, y avisa de la deuda sin bloquear
  await page.getByRole("link", { name: "Ajustes" }).click();
  await page.getByRole("link", { name: /Ciclo a cerrar/ }).click();
  await expect(page.getByText("$ 2.000").first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/sin cobrar en este ciclo/i)).toBeVisible();

  await page.getByRole("button", { name: "Cerrar ciclo" }).click();
  await expect(page.getByText("Cerrado")).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: "Cerrar ciclo" })).not.toBeVisible();

  // creo el siguiente ciclo
  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo siguiente");

  // el ciclo cerrado se puede seguir consultando, con los números intactos
  await page.getByRole("link", { name: /Ciclo a cerrar/ }).click();
  await expect(page).toHaveURL(/\/app\/cycles\/.+/, { timeout: 20000 });
  await expect(page.getByText("Cerrado")).toBeVisible();
  await expect(page.getByText("$ 2.000").first()).toBeVisible();
});
