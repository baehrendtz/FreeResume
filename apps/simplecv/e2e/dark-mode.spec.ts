import { test, expect } from "@playwright/test";
import { seedSession, dismissCookieConsent, toggleTheme } from "./helpers";

test.describe("Dark mode", () => {
  test.beforeEach(async ({ context, page }) => {
    await dismissCookieConsent(context);
    await seedSession(page);
  });

  test("defaults to light mode (no dark class)", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
  });

  test("toggles to dark mode", async ({ page, isMobile }) => {
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    await toggleTheme(page, isMobile);
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("toggles back to light mode", async ({ page, isMobile }) => {
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    // Toggle to dark
    await toggleTheme(page, isMobile);
    await expect(page.locator("html")).toHaveClass(/dark/);
    // Toggle back to light
    await toggleTheme(page, isMobile);
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });

  test("persists dark mode across page reload", async ({ page, isMobile }) => {
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    await toggleTheme(page, isMobile);
    await expect(page.locator("html")).toHaveClass(/dark/);

    // Reload
    await page.reload();
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("stores theme value in localStorage", async ({ page, isMobile }) => {
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    await toggleTheme(page, isMobile);

    const stored = await page.evaluate(() => localStorage.getItem("theme"));
    expect(stored).toBe("dark");
  });
});
