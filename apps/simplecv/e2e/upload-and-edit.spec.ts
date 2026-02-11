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

    const fileInput = page.locator('input[type="file"][accept=".pdf"]');
    await fileInput.setInputFiles(fixturePdf);

    await expect(
      page.getByText("Ditt CV är redo att redigera!")
    ).toBeVisible({ timeout: 15_000 });

    await page.getByRole("button", { name: "Börja redigera" }).click();

    await waitForEditor(page);

    const box = await page.locator("#cv-preview").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(200);
  });
});
