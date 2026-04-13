import { test, expect } from "@playwright/test";

test("can navigate to notebook page", async ({ page }) => {
  await page.goto("/notebook");
  await expect(page.getByText(/notebook/i)).toBeVisible();
});

test("notebook page shows create button", async ({ page }) => {
  await page.goto("/notebook");
  await expect(page.getByRole("button", { name: /new|create/i })).toBeVisible();
});
