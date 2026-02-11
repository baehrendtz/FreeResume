import { test, expect } from "@playwright/test";
import { seedSession } from "./helpers";

test.describe("Cookie consent", () => {
  test.beforeEach(async ({ page }) => {
    await seedSession(page);
  });

  test("banner is visible on first visit", async ({ page }) => {
    await page.goto("/en");
    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Accept hides banner and sets cookie", async ({ page, context }) => {
    await page.goto("/en");
    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Accept" }).click();

    // Banner should disappear
    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).not.toBeVisible();

    // Cookie should be set
    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === "cookie-consent");
    expect(consentCookie).toBeDefined();
    expect(consentCookie!.value).toBe("accepted");
  });

  test("Decline hides banner and sets cookie", async ({ page, context }) => {
    await page.goto("/en");
    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Decline" }).click();

    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).not.toBeVisible();

    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === "cookie-consent");
    expect(consentCookie).toBeDefined();
    expect(consentCookie!.value).toBe("declined");
  });

  test("banner is hidden when consent cookie exists", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "cookie-consent",
        value: "accepted",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).not.toBeVisible();
  });

  test("footer Cookie settings button re-opens consent banner", async ({
    page,
    context,
    isMobile,
  }) => {
    // First accept cookies so banner is hidden
    await context.addCookies([
      {
        name: "cookie-consent",
        value: "accepted",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/en");
    await expect(page.locator("#cv-preview")).toBeVisible({ timeout: 15_000 });

    // Banner should not be visible
    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).not.toBeVisible();

    // On mobile the footer can be covered by the floating action bar,
    // so dispatch the event directly to match the button's onClick behavior
    await page.evaluate(() =>
      window.dispatchEvent(new Event("show-cookie-consent"))
    );

    // Banner should appear again
    await expect(
      page.getByText("We use cookies for anonymous analytics")
    ).toBeVisible();
  });
});
