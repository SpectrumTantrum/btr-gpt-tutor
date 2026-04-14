import { test, expect } from "@playwright/test";

test("settings page shows theme selector", async ({ page }) => {
  await page.goto("/settings");
  const main = page.getByRole("main");
  await expect(main.getByText("Appearance")).toBeVisible();
  await expect(main.getByText("Theme")).toBeVisible();
});

test("settings page shows language selector", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByLabel("Language")).toBeVisible();
});
