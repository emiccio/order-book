import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Todos los tests pegan contra el mismo proyecto Supabase free-tier.
  // En paralelo, la contención de conexiones hace que un alta de ciclo
  // tarde más en quedar visible para el request siguiente, y un test
  // que clickea tan rápido como Playwright puede alcanzar a leer antes
  // de que eso asiente. Serializado, no pasa.
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: "http://localhost:3100",
  },
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
