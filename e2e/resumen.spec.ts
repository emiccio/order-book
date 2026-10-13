import { test, expect } from "@playwright/test";
import { createCycle } from "./helpers";

function uniqueEmail() {
  return `libreta-e2e-resumen-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("cambiar de ciclo cambia los números en pantalla", async ({ page }) => {
  const email = uniqueEmail();
  const password = "Test1234!";

  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Vendedora resumen");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();
  await expect(page).toHaveURL(/\/app$/);

  // Ciclo A (queda activo al crearlo)
  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo A");

  // pedido en Ciclo A: $5.000
  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await page.getByLabel("Clienta").selectOption({ label: "+ Nueva clienta" });
  await page.getByPlaceholder("Nombre de la nueva clienta").fill("Clienta Resumen");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByLabel("Clienta")).toHaveValue(/.+/);
  await page.getByPlaceholder("Producto").fill("Producto A");
  await page.getByLabel("Cantidad").fill("1");
  await page.getByLabel("Precio").fill("5000");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);

  // Ciclo B (nuevo ciclo activo)
  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo B");

  // pedido en Ciclo B: $9.000, misma clienta
  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await page.getByLabel("Clienta").selectOption({ label: "Clienta Resumen" });
  await page.getByPlaceholder("Producto").fill("Producto B");
  await page.getByLabel("Cantidad").fill("1");
  await page.getByLabel("Precio").fill("9000");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);

  // Resumen: por defecto muestra el ciclo activo (B) -> $ 9.000
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByText("$ 9.000").first()).toBeVisible();

  // cambio a Ciclo A -> $ 5.000, y la URL lo refleja
  await page.getByLabel("Ciclo").selectOption({ label: "Ciclo A" });
  await expect(page).toHaveURL(/cycle=/);
  await expect(page.getByText("$ 5.000").first()).toBeVisible();

  // "Todos los ciclos" -> suma los dos: $ 14.000
  await page.getByLabel("Ciclo").selectOption({ label: "Todos los ciclos" });
  await expect(page.getByText("$ 14.000").first()).toBeVisible();
});
