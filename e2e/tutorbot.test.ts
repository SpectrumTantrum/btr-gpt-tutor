import { test, expect } from "@playwright/test";

test("can navigate to tutorbot page", async ({ page }) => {
  await page.goto("/tutorbot");
  await expect(page.getByText(/tutorbot|bot/i)).toBeVisible();
});

test("tutorbot page shows create button", async ({ page }) => {
  await page.goto("/tutorbot");
  await expect(page.getByRole("button", { name: /new|create/i })).toBeVisible();
});
