import { test, expect } from "@playwright/test";
import { seedSession, dismissCookieConsent } from "./helpers";

test.describe("Header & Footer", () => {
  test.beforeEach(async ({ context, page }) => {
    await dismissCookieConsent(context);
    await seedSession(page);
  });

  test("Import PDF button opens import dialog", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Import button in desktop header only");
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    // Use the header-scoped button to avoid matching mobile dropdown items
    await page
      .locator("header")
      .getByRole("button", { name: "Import PDF" })
      .first()
      .click();

    // The import dialog should appear with a warning message
    // Use first() because the text appears in both sr-only DialogDescription and visible span
    await expect(
      page.getByText("This will replace your current CV data").first()
    ).toBeVisible();
  });

  test("Help button opens help dialog", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Help button in desktop header only");
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    await page.locator("header").getByRole("button", { name: "Help" }).click();

    await expect(
      page.getByRole("heading", { name: "About Free Resume" })
    ).toBeVisible();
    await expect(
      page.getByText("Free Resume is free and open source.")
    ).toBeVisible();
  });

  test("Download PDF button is present in header", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Download button in desktop header only");
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    const downloadBtn = page
      .locator("header")
      .getByRole("button", { name: "Download PDF" });
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();
  });

  test("footer shows copyright and open source link", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Copyright text (year is dynamic)
    await expect(footer.getByText(/© \d{4} Free Resume/)).toBeVisible();

    // Open source link
    const osLink = footer.getByRole("link", { name: "Free & open source" });
    await expect(osLink).toBeVisible();
    await expect(osLink).toHaveAttribute(
      "href",
      "https://github.com/baehrendtz/FreeResume"
    );
  });
});
