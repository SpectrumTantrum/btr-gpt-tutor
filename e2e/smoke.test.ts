import { test, expect } from "@playwright/test";

test("home page loads with correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/btr-gpt-tutor/);
});

test("home page shows welcome message", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome to btr-gpt-tutor")).toBeVisible();
});

test("sidebar navigation links are present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Chat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Knowledge" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
});
