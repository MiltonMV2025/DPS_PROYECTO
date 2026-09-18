import { expect, test } from "@playwright/test";

const ADMIN = { correo: "claudia.menendez@sonrisaperfecta.sv", password: "Dps2026*" };

test("unauthenticated visits are redirected to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
});

test("admin can sign in, see the dashboard and sign out", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(ADMIN.correo);
  await page.getByLabel("Contraseña").fill(ADMIN.password);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Barra lateral" })).toBeVisible();

  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("wrong credentials show an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(ADMIN.correo);
  await page.getByLabel("Contraseña").fill("incorrecta");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
});
