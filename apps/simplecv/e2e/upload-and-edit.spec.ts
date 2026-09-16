import { test, expect } from "@playwright/test";
import path from "path";
import { dismissCookieConsent, waitForEditor } from "./helpers";

const fixturePdf = path.join(__dirname, "fixtures", "linkedin-profile.pdf");

test.describe("LinkedIn PDF upload and edit flow", () => {
  test.beforeEach(async ({ context }) => {
    await dismissCookieConsent(context);
  });

  test("uploads PDF, completes onboarding, and renders CV preview", async ({
    page,
  }) => {
    await page.goto("/sv");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(fixturePdf);

    // The finished CV is shown right away, ready to download
    await expect(
      page.getByRole("heading", { name: "Ditt CV är klart" })
    ).toBeVisible({ timeout: 15_000 });
    await waitForEditor(page);
    // The template renders once its code has loaded, then the page gets its full height
    await expect
      .poll(async () => (await page.locator("#cv-preview").boundingBox())?.height ?? 0)
      .toBeGreaterThan(200);

    await page.getByRole("button", { name: "Redigera innehåll" }).click();
    await expect(page.getByLabel("Fullständigt namn")).toBeVisible();
  });
});
