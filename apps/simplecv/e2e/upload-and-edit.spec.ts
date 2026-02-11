import { test, expect } from "@playwright/test";
import path from "path";

const fixturePdf = path.join(__dirname, "fixtures", "linkedin-profile.pdf");

test.describe("LinkedIn PDF upload and edit flow", () => {
  test("uploads PDF, completes onboarding, and renders CV preview", async ({
    page,
  }) => {
    // 1. Navigate to Swedish locale
    await page.goto("/sv");

    // 2. Upload the LinkedIn PDF via the hidden file input
    const fileInput = page.locator('input[type="file"][accept=".pdf"]');
    await fileInput.setInputFiles(fixturePdf);

    // 3. Verify the onboarding wizard advances to the success step
    //    The success title in Swedish is "Ditt CV är redo att redigera!"
    await expect(
      page.getByText("Ditt CV är redo att redigera!")
    ).toBeVisible({ timeout: 15000 });

    // 4. Click the CTA button to enter the editor
    await page.getByRole("button", { name: "Börja redigera" }).click();

    // 5. Verify that the CV preview renders with a reasonable size
    const cvPreview = page.locator("#cv-preview");
    await expect(cvPreview).toBeVisible({ timeout: 10000 });

    const box = await cvPreview.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(200);

    // 6. Take a screenshot of the preview for visual verification
    await cvPreview.screenshot({ path: path.join(__dirname, "screenshots", "cv-preview.png") });
  });
});
