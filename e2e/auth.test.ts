import { test, expect } from "@playwright/test";

test("login page redirects to home in personal mode", async ({ page }) => {
  await page.goto("/login");
  // In personal mode (no Supabase), should redirect to home
  await page.waitForURL("/");
  await expect(page).toHaveURL("/");
});
