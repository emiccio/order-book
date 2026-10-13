import { test, expect } from "@playwright/test";
import { createCycle } from "./helpers";

function uniqueEmail() {
  return `libreta-e2e-acceptance-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

// Los 13 pasos del "Criterio de terminado" del roadmap, de punta a punta.
test("checklist de aceptación de la V1: los 13 pasos", async ({ page }) => {
  test.setTimeout(120_000);

  const email = uniqueEmail();
  const password = "Test1234!";

  await page.goto("/app/login");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByLabel("Nombre").fill("Vendedora aceptación");
  await page.getByLabel("Mail").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).last().click();
  await expect(page).toHaveURL(/\/app$/);

  // 1. crear una clienta
  await page.getByRole("link", { name: "Clientas" }).click();
  await page.getByRole("button", { name: "+ Agregar" }).click();
  await page.getByLabel("Nombre").fill("Clienta Aceptación");
  await page.getByLabel("WhatsApp").fill("2235551234");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Clienta Aceptación")).toBeVisible({ timeout: 20000 });

  // 2. crear un ciclo
  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo aceptación");

  // 3. configurar una marca
  await page.getByPlaceholder("Nombre de la marca").fill("Natura");
  await page.getByPlaceholder("% gan.").fill("30");
  await page.getByRole("button", { name: "+ Agregar marca" }).click();
  await expect(page.getByText("30% de ganancia")).toBeVisible({ timeout: 20000 });

  // 4. crear un pedido con varios productos
  await page.getByRole("button", { name: "+ Nuevo pedido" }).click();
  await page.getByLabel("Clienta").selectOption({ label: "Clienta Aceptación" });
  await page.getByPlaceholder("Producto").fill("Perfume Kaiak");
  await page.getByLabel("Marca", { exact: true }).selectOption({ label: "Natura" });
  await page.getByLabel("Cantidad").fill("2");
  await page.getByLabel("Precio").fill("5000");
  await page.getByRole("button", { name: "+ Agregar producto" }).click();
  await page.getByPlaceholder("Producto").nth(1).fill("Vela propia");
  await page.getByLabel("Cantidad").nth(1).fill("1");
  await page.getByLabel("Precio").nth(1).fill("2000");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/app\/orders$/, { timeout: 20000 });
  // Total: 2*5000 + 2000 = 12000
  await expect(page.getByText("$ 12.000").first()).toBeVisible();

  await page.getByText("Clienta Aceptación").click();
  await expect(page).toHaveURL(/\/app\/orders\/.+/);

  // compartir el pedido por WhatsApp: el link queda bien armado
  const shareLink = page.getByRole("link", { name: "Compartir por WhatsApp" });
  await expect(shareLink).toHaveAttribute("href", /^https:\/\/wa\.me\/5492235551234\?text=/);

  // 5. registrar un pago parcial
  await page.getByPlaceholder("Monto").fill("4000");
  await page.getByRole("button", { name: "+ Registrar pago" }).click();
  await expect(page.getByText("Debe $ 8.000")).toBeVisible({ timeout: 20000 });

  // 6. registrar otro pago
  await page.getByPlaceholder("Monto").fill("3000");
  await page.getByRole("button", { name: "+ Registrar pago" }).click();
  await expect(page.getByText("Debe $ 5.000")).toBeVisible({ timeout: 20000 });

  // 7. marcar la entrega
  await page.getByLabel("Estado de entrega").selectOption({ label: "Entregado" });
  await expect(page.getByLabel("Estado de entrega")).toHaveValue("delivered", {
    timeout: 20000,
  });

  // 8. consultar quién debe
  await page.getByRole("link", { name: "Resumen", exact: true }).click();
  await expect(page.getByText("Principales deudoras")).toBeVisible({ timeout: 20000 });
  await expect(page.getByText("Clienta Aceptación")).toBeVisible();
  await expect(page.getByText("$ 5.000").first()).toBeVisible();

  // 9. enviar un recordatorio por WhatsApp
  const remindLink = page.getByRole("link", { name: "Recordar" });
  await expect(remindLink).toHaveAttribute("href", /^https:\/\/wa\.me\/5492235551234\?text=/);

  // 10. registrar un gasto
  await page.getByRole("link", { name: "Ajustes" }).click();
  await page.getByRole("link", { name: "Gastos del ciclo activo" }).click();
  await expect(page).toHaveURL(/\/app\/expenses$/, { timeout: 20000 });
  await page.locator('select[name="category"]').selectOption({ label: "Envío" });
  await page.getByPlaceholder("Monto").fill("1000");
  await page.getByRole("button", { name: "+ Registrar gasto" }).click();
  await expect(page.getByText("$ 1.000").first()).toBeVisible({ timeout: 20000 });

  // 11. ver el resultado del ciclo
  // Ganancia de productos: (5000*0.7 costo Natura => ganancia 1500 x2=3000) + Vela sin costo (2000) = 5000
  // Resultado = 5000 - 1000 (gasto) = 4000
  await page.getByRole("link", { name: "Ajustes" }).click();
  await page.getByRole("link", { name: /Ciclo aceptación/ }).click();
  await expect(page).toHaveURL(/\/app\/cycles\/.+/, { timeout: 20000 });
  await expect(page.getByText("Resultado")).toBeVisible();
  await expect(page.getByText("$ 4.000").first()).toBeVisible();

  // 12. cerrar el ciclo
  await page.getByRole("button", { name: "Cerrar ciclo" }).click();
  await expect(page.getByText("Cerrado")).toBeVisible({ timeout: 20000 });

  // 13. volver a consultar ciclos anteriores
  await page.getByRole("link", { name: "Ajustes" }).click();
  await createCycle(page, "Ciclo siguiente aceptación");
  await page.getByRole("link", { name: /Ciclo aceptación/ }).click();
  await expect(page).toHaveURL(/\/app\/cycles\/.+/, { timeout: 20000 });
  await expect(page.getByText("Cerrado")).toBeVisible();
  await expect(page.getByText("$ 4.000").first()).toBeVisible();
});
