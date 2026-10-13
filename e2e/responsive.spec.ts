import { test, expect } from "@playwright/test";
import { createCycle } from "./helpers";

function uniqueEmail() {
  return `libreta-e2e-responsive-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

const SIZES = [
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

for (const size of SIZES) {
  test(`sin scroll horizontal en ${size.name}: Resumen, Pedidos, Clientas, Ajustes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: size.width, height: size.height });

    const email = uniqueEmail();
    const password = "Test1234!";

    await page.goto("/app/login");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await page.getByLabel("Nombre").fill("Vendedora responsive");
    await page.getByLabel("Mail").fill(email);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Crear cuenta" }).last().click();
    await expect(page).toHaveURL(/\/app$/);

    await page.getByRole("link", { name: "Ajustes" }).click();
    await createCycle(page, "Ciclo responsive");

    for (const path of ["/app", "/app/orders", "/app/customers", "/app/settings"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${path} desborda horizontalmente en ${size.name}`).toBe(false);
    }
  });
}
