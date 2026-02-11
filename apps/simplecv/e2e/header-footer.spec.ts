import { test, expect } from "@playwright/test";
import { seedSession, dismissCookieConsent, waitForEditor } from "./helpers";

test.describe("Header & Footer", () => {
  test.beforeEach(async ({ context, page }) => {
    await dismissCookieConsent(context);
    await seedSession(page);
  });

  test("Import PDF button opens import dialog", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Import button in desktop header only");
    await page.goto("/en");
    await waitForEditor(page);

    await page
      .locator("header")
      .getByRole("button", { name: "Import PDF" })
      .first()
      .click();

    await expect(
      page.getByText("This will replace your current CV data").first()
    ).toBeVisible();
  });

  test("mobile menu Import PDF opens import dialog", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: /More actions/ }).click();
    await page.getByRole("menuitem", { name: /Import PDF/ }).click();

    await expect(
      page.getByText("This will replace your current CV data").first()
    ).toBeVisible();
  });

  test("Help button opens help dialog", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Help button in desktop header only");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("header").getByRole("button", { name: "Help" }).click();

    await expect(
      page.getByRole("heading", { name: "About Free Resume" })
    ).toBeVisible();
    await expect(
      page.getByText("Free Resume is free and open source.")
    ).toBeVisible();
  });

  test("mobile menu Help opens help dialog", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: /More actions/ }).click();
    await page.getByRole("menuitem", { name: /Help/ }).click();

    await expect(
      page.getByRole("heading", { name: "About Free Resume" })
    ).toBeVisible();
  });

  test("Download PDF button is present in header", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Download button in desktop header only");
    await page.goto("/en");
    await waitForEditor(page);

    const downloadBtn = page
      .locator("header")
      .getByRole("button", { name: "Download PDF" });
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();
  });

  test("mobile menu shows Download PDF option", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: /More actions/ }).click();
    await expect(
      page.getByRole("menuitem", { name: /Download PDF/ })
    ).toBeVisible();
  });

  test("footer shows copyright and open source link", async ({ page }) => {
    await page.goto("/en");
    await waitForEditor(page);

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
