import { test, expect } from "@playwright/test";
import { createCycle } from "./helpers";

function uniqueEmail() {
  return `libreta-e2e-orders-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("alta de pedido de punta a punta", async ({ page }) => {
  const email = uniqueEmail();
  const password = "Test1234!";

  // registro
  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Vendedora de prueba");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();
  await expect(page).toHaveURL(/\/app$/);

  // creo un ciclo (hace falta uno activo para cargar pedidos)
  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo de prueba");

  // creo una marca para probar costo por %
  await page.getByPlaceholder("Nombre de la marca").fill("Natura");
  await page.getByPlaceholder("% gan.").fill("30");
  await page.getByRole("button", { name: "+ Agregar marca" }).click();
  await expect(page.getByText("30% de ganancia")).toBeVisible();

  // + Nuevo pedido desde el FAB (visible en cualquier pantalla)
  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await expect(page.getByRole("dialog", { name: "Nuevo pedido" })).toBeVisible({ timeout: 20000 });

  // elijo clienta nueva sin salir de la hoja
  await page.getByLabel("Clienta").selectOption({ label: "+ Nueva clienta" });
  await page.getByPlaceholder("Nombre de la nueva clienta").fill("Laura Gómez");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(page.getByLabel("Clienta")).toHaveValue(/.+/);

  // producto 1, con marca
  await page.getByPlaceholder("Producto").fill("Perfume Kaiak");
  await page.getByLabel("Marca", { exact: true }).selectOption({ label: "Natura" });
  await page.getByLabel("Cantidad").fill("2");
  await page.getByLabel("Precio").fill("5000");

  // producto 2, sin marca
  await page.getByRole("button", { name: "+ Agregar producto" }).click();
  const products = page.getByPlaceholder("Producto");
  await products.nth(1).fill("Vela propia");
  const prices = page.getByLabel("Precio");
  await prices.nth(1).fill("1000");

  await expect(page.getByText("$ 11.000")).toBeVisible(); // total: 10000 + 1000

  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/);
  await expect(page.getByText("Laura Gómez")).toBeVisible();
  await expect(page.getByText("$ 11.000").first()).toBeVisible();

  // abro el pedido y lo edito
  await page.getByText("Laura Gómez").click();
  await expect(page).toHaveURL(/\/app\/orders\/.+/);
  await expect(page.getByPlaceholder("Producto").first()).toHaveValue("Perfume Kaiak");

  // cambio el estado de entrega
  await page.getByLabel("Estado de entrega").selectOption({ label: "Recibido" });
  await expect(page.getByLabel("Estado de entrega")).toHaveValue("received");
});
