import { test, expect } from "@playwright/test";

test("can navigate to chat page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("complementary", { name: /primary navigation/i }).getByRole("link", { name: "Chat" }).click();
  await page.waitForURL(/\/chat/);
  await expect(page.getByPlaceholder(/inquire|ask|document/i)).toBeVisible();
});

test("can navigate to knowledge page", async ({ page }) => {
  await page.goto("/knowledge");
  await expect(page.getByRole("heading", { name: /knowledge base/i })).toBeVisible();
});

test("can navigate to settings page", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("main").getByRole("heading", { name: /settings/i })).toBeVisible();
});
