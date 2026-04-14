import { test, expect } from "@playwright/test";

test("icon rail is visible", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("complementary", { name: /primary navigation/i })
  ).toBeVisible();
});

test("icon rail has all 9 nav items", async ({ page }) => {
  await page.goto("/");
  const rail = page.getByRole("complementary", { name: /primary navigation/i });
  for (const label of [
    "Home",
    "Chat",
    "Classroom",
    "Knowledge",
    "Co-Writer",
    "Guide",
    "Notebook",
    "TutorBot",
    "Settings",
  ]) {
    await expect(rail.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
});

test("clicking a nav icon navigates to the page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("complementary", { name: /primary navigation/i })
    .getByRole("link", { name: "Chat" })
    .click();
  await expect(page).toHaveURL(/\/chat/);
});
