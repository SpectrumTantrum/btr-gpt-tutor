import { test, expect } from "@playwright/test";

test("can navigate to classroom page", async ({ page }) => {
  await page.goto("/classroom");
  await expect(page.getByText(/classroom/i)).toBeVisible();
});

test("classroom page shows generation form", async ({ page }) => {
  await page.goto("/classroom");
  await expect(page.getByPlaceholder(/topic/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /generate/i })).toBeVisible();
});
