import { expect, test } from "@playwright/test";

test("desktop analytics first, full-width sections, sorting and empty recovery", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const analytics = page.getByRole("region", { name: "Análisis rápido" });
  const appointments = page.getByRole("region", { name: "Próximas citas" });
  const first = await analytics.boundingBox();
  const second = await appointments.boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(first!.y + first!.height).toBeLessThan(second!.y);
  expect(Math.abs(first!.width - second!.width)).toBeLessThan(2);
  await expect(
    page.getByRole("complementary", { name: "Barra lateral" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
  await expect(
    page.getByRole("columnheader", { name: "Servicio" }).getByRole("button"),
  ).toHaveCount(0);
  await expect(
    page.getByRole("columnheader", { name: "Servicio" }),
  ).not.toHaveAttribute("aria-sort");
  await page.getByRole("button", { name: "Paciente", exact: true }).click();
  await expect(
    page.getByRole("columnheader", { name: "Paciente" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await page.getByRole("button", { name: "Paciente", exact: true }).click();
  await expect(page.locator("tbody tr").first()).toContainText(
    "Sofía Hernández",
  );
  await page
    .getByRole("searchbox", { name: "Buscar", exact: true })
    .fill("no-result-123");
  await expect(
    page.locator("h3:visible").filter({ hasText: "No se encontraron citas" }),
  ).toBeVisible();
  await expect(
    page.locator('[role="status"]').filter({ hasText: "0–0 de 0 citas" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restablecer búsqueda" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("button", { name: "Contraer menú" }).click();
  await expect(
    page.getByRole("button", { name: "Expandir menú" }),
  ).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Expandir menú" }).click();
  expect(errors).toEqual([]);
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
});

test("Radix Select uses portal, keyboard and 25/50/100 page-size controls", async ({
  page,
}) => {
  await page.goto("/");
  const status = page.getByRole("combobox", { name: "Estado", exact: true });
  await status.focus();
  await page.keyboard.press("Enter");
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  expect(await list.evaluate((element) => !element.closest("main"))).toBe(true);
  await expect(
    page.getByRole("option", { name: "Todos", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("option", { name: "Todos", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: "Confirmadas", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(status).toContainText("Confirmadas");
  await expect(status).toBeFocused();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await status.click();
  await page.getByRole("option", { name: "Canceladas", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  const pageSize = page.getByRole("combobox", { name: "Mostrar" });
  for (const size of ["50", "100", "25"]) {
    await pageSize.click();
    await page.getByRole("option", { name: size, exact: true }).click();
    await expect(pageSize).toContainText(size);
  }
  await expect(
    page.getByRole("button", { name: "Página anterior" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Página siguiente" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Página 1", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("read-only appointment dialog traps focus and restores trigger", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Ver cita de Ana Martínez",
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Detalle de cita" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("No se registran ni modifican citas");
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: "test-results/appointment-dialog.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile Sheet navigation, focus restoration and no page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(
    page.getByRole("complementary", { name: "Barra lateral" }),
  ).toBeHidden();
  const trigger = page.getByRole("button", { name: "Abrir menú" });
  await trigger.click();
  const sheet = page.getByRole("dialog", { name: "Sonrisa Digital" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await sheet.evaluate((element) => element.contains(document.activeElement)),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/navigation-mobile.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await sheet.getByRole("link", { name: "Citas", exact: true }).click();
  await expect(page).toHaveURL(/\/citas$/);
  await expect(sheet).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Citas y agenda" }),
  ).toBeVisible();
  await expect(page.locator("article")).toHaveCount(5);
  await expect(page.locator("table")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/");
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  for (const width of [320, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("primary surfaces use the requested white foreground", async ({ page }) => {
  await page.goto("/");
  const colors = await page
    .getByRole("columnheader", { name: "Paciente" })
    .evaluate((element) => ({
      text: getComputedStyle(element).color,
      background: getComputedStyle(element.parentElement!).backgroundColor,
    }));
  expect(colors.text).toBe("rgb(255, 255, 255)");
});
