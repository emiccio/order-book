import { test, expect } from "@playwright/test";
import { createCycle } from "./helpers";

function uniqueEmail() {
  return `libreta-e2e-payments-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("pagos parciales de un pedido, hasta quedar pago", async ({ page }) => {
  const email = uniqueEmail();
  const password = "Test1234!";

  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Vendedora pagos");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();
  await expect(page).toHaveURL(/\/app$/);

  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo pagos");

  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await page.getByLabel("Clienta").selectOption({ label: "+ Nueva clienta" });
  await page.getByPlaceholder("Nombre de la nueva clienta").fill("Deudora de prueba");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByLabel("Clienta")).toHaveValue(/.+/);

  await page.getByPlaceholder("Producto").fill("Pedido grande");
  await page.getByLabel("Cantidad").fill("1");
  await page.getByLabel("Precio").fill("50000");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);

  await page.getByText("Deudora de prueba").click();
  await expect(page).toHaveURL(/\/app\/orders\/.+/);

  // pago parcial de $20.000 -> Debe $30.000
  await page.getByPlaceholder("Monto").fill("20000");
  await page.getByRole("button", { name: "+ Registrar pago" }).click();
  await expect(page.getByText("Debe $ 30.000")).toBeVisible();

  // pago de los $30.000 restantes -> Pagado
  await page.getByPlaceholder("Monto").fill("30000");
  await page.getByRole("button", { name: "+ Registrar pago" }).click();
  await expect(page.getByText("Pagado", { exact: true })).toBeVisible();

  // ya no hay formulario para cargar más pagos (el saldo es cero)
  await expect(page.getByPlaceholder("Monto")).not.toBeVisible();
});

test("un pago mayor al saldo se rechaza con el motivo", async ({ page }) => {
  const email = uniqueEmail();
  const password = "Test1234!";

  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Vendedora pagos 2");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();
  await expect(page).toHaveURL(/\/app$/);

  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo pagos 2");

  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await page.getByLabel("Clienta").selectOption({ label: "+ Nueva clienta" });
  await page.getByPlaceholder("Nombre de la nueva clienta").fill("Otra Deudora");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByLabel("Clienta")).toHaveValue(/.+/);

  await page.getByPlaceholder("Producto").fill("Pedido chico");
  await page.getByLabel("Cantidad").fill("1");
  await page.getByLabel("Precio").fill("10000");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);

  await page.getByText("Otra Deudora").click();
  await expect(page).toHaveURL(/\/app\/orders\/.+/);

  await page.getByPlaceholder("Monto").fill("15000");
  await page.getByRole("button", { name: "+ Registrar pago" }).click();

  await expect(page.getByText(/no puede superar el saldo pendiente/i)).toBeVisible();
  await expect(page.getByText("Debe $ 10.000")).toBeVisible();
});
