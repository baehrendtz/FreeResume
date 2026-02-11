import { test, expect } from "@playwright/test";
import { seedSession, dismissCookieConsent, waitForEditor } from "./helpers";

test.describe("Language switcher", () => {
  test.beforeEach(async ({ context, page }) => {
    await dismissCookieConsent(context);
    await seedSession(page);
  });

  test("English locale shows English content", async ({ page }) => {
    await page.goto("/en");
    await waitForEditor(page);
    // The language switcher should offer to switch to Swedish
    await expect(
      page.getByRole("button", { name: "Byt till svenska" })
    ).toBeVisible();
  });

  test("Swedish locale shows Swedish content", async ({ page }) => {
    await page.goto("/sv");
    await waitForEditor(page);
    // The language switcher should offer to switch to English
    await expect(
      page.getByRole("button", { name: "Switch to English" })
    ).toBeVisible();
  });

  test("switches from English to Swedish", async ({ page }) => {
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: "Byt till svenska" }).click();
    await page.waitForURL("**/sv");

    // Should now show English switch option
    await expect(
      page.getByRole("button", { name: "Switch to English" })
    ).toBeVisible();
  });

  test("switches from Swedish to English", async ({ page }) => {
    await page.goto("/sv");
    await waitForEditor(page);

    await page.getByRole("button", { name: "Switch to English" }).click();
    await page.waitForURL("**/en");

    await expect(
      page.getByRole("button", { name: "Byt till svenska" })
    ).toBeVisible();
  });

  test("editor tab labels update when language changes", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    // English labels
    await expect(page.getByRole("button", { name: "Basics" })).toBeVisible();

    // Switch to Swedish
    await page.getByRole("button", { name: "Byt till svenska" }).click();
    await page.waitForURL("**/sv");
    await waitForEditor(page);

    // Swedish labels
    await expect(
      page.getByRole("button", { name: "Grunduppgifter" })
    ).toBeVisible();
  });
});
