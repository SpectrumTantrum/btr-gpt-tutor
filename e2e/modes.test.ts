import { test, expect } from "@playwright/test";

test("chat page shows mode switcher", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByRole("button", { name: /chat/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /deep solve/i })).toBeVisible();
});

test("can switch chat mode", async ({ page }) => {
  await page.goto("/chat");
  await page.getByRole("button", { name: /deep solve/i }).click();
  await expect(page.getByRole("button", { name: /deep solve/i })).toHaveAttribute("data-active", "true");
});
