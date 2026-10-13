import { test, expect } from "@playwright/test";

test("la landing responde sin sesión y no hace ninguna consulta a la base", async ({ page }) => {
  const supabaseRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(".supabase.co")) supabaseRequests.push(request.url());
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /Sabé quién te debe y cuánto ganaste/i }),
  ).toBeVisible();

  expect(supabaseRequests).toEqual([]);
});

test("los metadatos para compartir están puestos", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Libreta de Ventas");

  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toBeTruthy();

  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute("content");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogTitle).toBeTruthy();
  expect(ogDescription).toBeTruthy();
  expect(ogImage).toBeTruthy();

  const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute("content");
  expect(twitterCard).toBe("summary_large_image");
});

test("el botón principal y el del cierre llevan al registro", async ({ page }) => {
  await page.goto("/");

  const signupLinks = page.getByRole("link", { name: "Crear mi libreta gratis" });
  await expect(signupLinks).toHaveCount(2);
  for (const link of await signupLinks.all()) {
    await expect(link).toHaveAttribute("href", "/app/login?mode=signup");
  }
});

test('"Ver cómo funciona" baja a la sección de los 3 pasos', async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Ver cómo funciona" }).click();
  await expect(page).toHaveURL(/#como-funciona$/);
  await expect(page.getByRole("heading", { name: "En 3 pasos" })).toBeInViewport();
});

test("arriba y en el pie se puede entrar directo, sin pasar por crear cuenta", async ({ page }) => {
  await page.goto("/");

  // Uno arriba (para quien ya tiene cuenta, sin bajar toda la página) y
  // otro en el pie.
  const loginLinks = page.getByRole("link", { name: "Iniciar sesión" });
  await expect(loginLinks).toHaveCount(2);
  for (const link of await loginLinks.all()) {
    await expect(link).toHaveAttribute("href", "/app/login");
  }

  await expect(page.getByRole("link", { name: "Privacidad" })).toHaveAttribute(
    "href",
    "/privacidad",
  );
  await expect(page.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/5492236146209/,
  );
});

test("la landing se ve bien en ancho de celular y de escritorio", async ({ page }) => {
  for (const size of [
    { width: 390, height: 844 }, // celular
    { width: 1920, height: 1080 }, // escritorio
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Sabé quién te debe y cuánto ganaste/i }),
    ).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `desborda horizontalmente en ${size.width}x${size.height}`).toBe(false);
  }
});

test("en 390x844 el título y el botón principal entran sin scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const heading = page.getByRole("heading", { name: /Sabé quién te debe y cuánto ganaste/i });
  const cta = page.getByRole("link", { name: "Crear mi libreta gratis" }).first();

  await expect(heading).toBeInViewport();
  await expect(cta).toBeInViewport();
});

test('el botón "Crear mi libreta gratis" abre el registro directo en "Crear cuenta"', async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Crear mi libreta gratis" }).first().click();
  await expect(page).toHaveURL(/\/app\/login\?mode=signup$/);
  await expect(page.getByLabel("Nombre")).toBeVisible();
});

test("/privacidad carga y marca que es un borrador", async ({ page }) => {
  await page.goto("/privacidad");
  await expect(page.getByRole("heading", { name: "Privacidad", exact: true })).toBeVisible();
  await expect(page.getByText(/borrador/i)).toBeVisible();
});
