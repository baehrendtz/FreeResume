import { test, expect } from "@playwright/test";
import { dismissCookieConsent, seedSession, waitForEditor } from "./helpers";

test.describe("Onboarding", () => {
  test.beforeEach(async ({ context }) => {
    await dismissCookieConsent(context);
  });

  test("shows the onboarding title on first visit", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { name: "Turn your LinkedIn profile into a polished CV in a minute" })
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
      page.getByRole("heading", { name: "Turn your LinkedIn profile into a polished CV in a minute" })
    ).not.toBeVisible();
  });

  test('"Try with an example" opens the result with the sample CV', async ({
    page,
  }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Try with an example" }).click();
    await expect(page.getByRole("heading", { name: "Your CV is ready" })).toBeVisible();
    await expect(page.getByText("This is an example CV.", { exact: false })).toBeVisible();
    await page.getByRole("button", { name: "Edit content" }).click();
    await expect(page.getByLabel("Full Name")).toHaveValue("Anna Lindqvist");
  });

  test("shows the LinkedIn steps with a link to the profile", async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(
      page.getByRole("heading", { name: "Click Resources and choose Save to PDF" })
    ).toBeVisible();
    const profileLink = page.getByRole("link", { name: "Open my profile" });
    await expect(profileLink).toHaveAttribute("href", "https://www.linkedin.com/in/me/");

    // Troubleshooting tips are collapsed until asked for
    const tip = page.getByText("Look for More instead of Resources.");
    await expect(tip).not.toBeVisible();
    await page.getByText("Can't find the button?").click();
    await expect(tip).toBeVisible();
  });
});
