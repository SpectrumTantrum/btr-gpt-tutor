import { test, expect } from "@playwright/test";

test("can navigate to co-writer page", async ({ page }) => {
  await page.goto("/co-writer");
  await expect(page.getByRole("textbox")).toBeVisible();
});

test("co-writer shows undo and export buttons", async ({ page }) => {
  await page.goto("/co-writer");
  await expect(page.getByRole("button", { name: /undo/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /export/i })).toBeVisible();
});
