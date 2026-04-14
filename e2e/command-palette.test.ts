import { test, expect } from "@playwright/test";

test("command palette opens on Cmd+K", async ({ page }) => {
  await page.goto("/");
  // Wait for React hydration — IconRail presence confirms the keyboard listener is mounted
  await expect(page.getByRole("complementary", { name: /primary navigation/i })).toBeVisible();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");
  await expect(page.getByPlaceholder(/search or jump/i)).toBeVisible();
});

test("command palette navigates to chat", async ({ page }) => {
  await page.goto("/");
  // Wait for React hydration — IconRail presence confirms the keyboard listener is mounted
  await expect(page.getByRole("complementary", { name: /primary navigation/i })).toBeVisible();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+k" : "Control+k");
  await page.getByRole("option", { name: "Chat" }).click();
  await page.waitForURL(/\/chat/);
});
