import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Crea un ciclo desde Ajustes y espera a que quede activo. El proyecto
 * Supabase free-tier que usamos para probar a veces tarda un momento en que
 * el ciclo activo quede visible para el próximo request (connection
 * pooler), así que además de esperar el badge "Activo" le damos un
 * respiro antes de seguir — sin esto, un click inmediato en "+ Nuevo
 * pedido" puede alcanzar a llegar antes de que asiente.
 */
export async function createCycle(page: Page, name: string): Promise<void> {
  await page.getByPlaceholder("Nombre del ciclo (ej. Octubre)").fill(name);
  await page.getByRole("button", { name: "+ Nuevo ciclo" }).click();
  await expect(page.getByText("Activo", { exact: true })).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3000);
}
