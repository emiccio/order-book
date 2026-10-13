import { test, expect } from "@playwright/test";

test("/app sin sesión redirige a /app/login", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveURL(/\/app\/login$/);
  await expect(page.getByRole("heading", { name: "Libreta de Ventas" })).toBeVisible();
});
