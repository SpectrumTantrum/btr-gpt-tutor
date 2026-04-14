import { test, expect } from "@playwright/test";

test("home page loads with correct title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/btr-gpt-tutor/);
});

test("icon rail shows all primary navigation links", async ({ page }) => {
  await page.goto("/");
  const rail = page.getByRole("complementary", { name: /primary navigation/i });
  for (const label of ["Home", "Chat", "Classroom", "Knowledge", "Co-Writer", "Guide", "Notebook", "TutorBot", "Settings"]) {
    await expect(rail.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
});

test("context panel is visible on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("complementary", { name: /section context/i })).toBeVisible();
});
