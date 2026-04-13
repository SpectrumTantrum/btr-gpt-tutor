import { test, expect } from "@playwright/test";

test("settings page shows theme selector", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByText("Appearance")).toBeVisible();
  await expect(page.getByText("Theme")).toBeVisible();
});

test("settings page shows language selector", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByLabel("Language")).toBeVisible();
});
