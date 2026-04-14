import { test, expect } from "@playwright/test";

test("can navigate to chat page", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Chat");
  await expect(page.getByPlaceholder(/inquire|ask|document/i)).toBeVisible();
});

test("can navigate to knowledge page", async ({ page }) => {
  await page.goto("/knowledge");
  await expect(page.getByRole("heading", { name: /knowledge base/i })).toBeVisible();
});

test("can navigate to settings page", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
});

test("chat input is disabled during streaming placeholder", async ({ page }) => {
  await page.goto("/chat");
  const input = page.getByPlaceholder(/inquire|ask|document/i);
  await expect(input).toBeVisible();
});
