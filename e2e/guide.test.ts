import { test, expect } from "@playwright/test";

test("can navigate to guide page", async ({ page }) => {
  await page.goto("/guide");
  await expect(page.getByRole("main").getByText(/guide|learning/i).first()).toBeVisible();
});

test("guide page shows topic input", async ({ page }) => {
  await page.goto("/guide");
  await expect(page.getByPlaceholder(/topic/i)).toBeVisible();
});
