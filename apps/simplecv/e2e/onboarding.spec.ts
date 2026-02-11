import { test, expect } from "@playwright/test";
import { dismissCookieConsent, seedSession } from "./helpers";

test.describe("Onboarding", () => {
  test.beforeEach(async ({ context }) => {
    await dismissCookieConsent(context);
  });

  test("shows the onboarding title on first visit", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { name: "Create your professional CV" })
    ).toBeVisible();
  });

  test('"Start from scratch" completes onboarding and opens editor', async ({
    page,
  }) => {
    await page.goto("/en");
    // Use the button that contains "Start from scratch" heading text
    const scratchBtn = page.getByRole("button", {
      name: /Start from scratch/,
    });
    await scratchBtn.click();
    // Success step should appear
    await expect(
      page.getByText("Your blank CV is ready")
    ).toBeVisible({ timeout: 10_000 });
    // Click the CTA to enter editor
    await page.getByRole("button", { name: "Start editing" }).click();
    // Editor should be visible with the CV preview
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 10_000 });
  });

  test("skips onboarding when session already exists", async ({ page }) => {
    await seedSession(page);
    await page.goto("/en");
    // Should go directly to editor
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 10_000 });
    // Onboarding title should not be visible
    await expect(
      page.getByRole("heading", { name: "Create your professional CV" })
    ).not.toBeVisible();
  });

  test("LinkedIn guide accordion toggles open and closed", async ({
    page,
  }) => {
    await page.goto("/en");
    const trigger = page.getByText("How do I get my LinkedIn PDF?");
    await expect(trigger).toBeVisible();

    // Click to open
    await trigger.click();
    await expect(page.getByText("Go to your LinkedIn profile")).toBeVisible();

    // Click to close
    await trigger.click();
    await expect(
      page.getByText("Go to your LinkedIn profile")
    ).not.toBeVisible();
  });
});
