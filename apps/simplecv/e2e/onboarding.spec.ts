import { test, expect } from "@playwright/test";
import { dismissCookieConsent, seedSession, waitForEditor } from "./helpers";

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
    // A blank CV has nothing to review, so the editor opens directly
    await waitForEditor(page);
    await expect(page.getByLabel("Full Name")).toBeVisible();
  });

  test("skips onboarding when session already exists", async ({ page }) => {
    await seedSession(page);
    await page.goto("/en");
    // Should go directly to editor
    await waitForEditor(page);
    // Onboarding title should not be visible
    await expect(
      page.getByRole("heading", { name: "Create your professional CV" })
    ).not.toBeVisible();
  });

  test("LinkedIn guide is open by default and can be collapsed", async ({
    page,
  }) => {
    await page.goto("/en");
    const trigger = page.getByText("How do I get my LinkedIn PDF?");
    const firstStep = page.getByText("Open your LinkedIn profile in a desktop browser");
    await expect(firstStep).toBeVisible();
    await expect(page.getByRole("link", { name: "Open my profile" })).toBeVisible();

    // Click to close
    await trigger.click();
    await expect(firstStep).not.toBeVisible();

    // Click to open again
    await trigger.click();
    await expect(firstStep).toBeVisible();
  });
});
