import { test, expect } from "@playwright/test";
import { seedSession, dismissCookieConsent, MINIMAL_CV, waitForEditor } from "./helpers";

test.describe("Editor", () => {
  test.beforeEach(async ({ context, page }) => {
    await dismissCookieConsent(context);
    await seedSession(page);
  });

  test("shows all 9 sidebar tabs on desktop", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    const expectedTabs = [
      "Template",
      "Basics",
      "Summary",
      "Experience",
      "Education",
      "Skills",
      "Languages",
      "Extras",
      "Settings",
    ];
    const sidebar = page.locator("nav").first();
    for (const tab of expectedTabs) {
      await expect(
        sidebar.getByRole("button", { name: tab, exact: true })
      ).toBeVisible();
    }
  });

  test("shows all 9 stepper icons on mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile stepper only visible on mobile");
    await page.goto("/en");
    await waitForEditor(page);

    // Mobile stepper uses icon buttons with title attributes
    const stepper = page.locator("nav");
    const stepButtons = stepper.getByRole("button");
    await expect(stepButtons).toHaveCount(9);
  });

  test("Basics form shows name field with seeded value", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Basics" }).click();

    const nameInput = page.getByLabel("Full Name");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(MINIMAL_CV.name);
  });

  test("mobile stepper navigates to Basics and shows name field", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: "Basics" }).click();

    const nameInput = page.getByLabel("Full Name");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue(MINIMAL_CV.name);
  });

  test("Experience tab shows seeded experience entry", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Experience" }).click();
    await expect(page.getByText("Senior Developer").first()).toBeVisible();
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
  });

  test("mobile stepper navigates to Experience and shows entry", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: "Experience" }).click();
    await expect(page.getByText("Senior Developer").first()).toBeVisible();
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
  });

  test("Skills tab shows seeded skills", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Skills" }).click();
    for (const skill of MINIMAL_CV.skills) {
      await expect(page.getByText(skill).first()).toBeVisible();
    }
  });

  test("mobile stepper navigates to Skills and shows seeded skills", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: "Skills" }).click();
    for (const skill of MINIMAL_CV.skills) {
      await expect(page.getByText(skill).first()).toBeVisible();
    }
  });

  test("editing name updates the CV preview", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Preview not visible on mobile");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Basics" }).click();
    const nameInput = page.getByLabel("Full Name");
    await nameInput.fill("Jane Doe");

    await expect(
      page.locator("#cv-preview").getByRole("heading", { name: "Jane Doe" })
    ).toBeVisible({ timeout: 5_000 });
  });

  test("template switcher shows available templates", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Template" }).click();
    const editor = page.locator("form");
    await expect(editor.getByText("Basic", { exact: true })).toBeVisible();
    await expect(editor.getByText("Professional", { exact: true })).toBeVisible();
    await expect(editor.getByText("Creative", { exact: true })).toBeVisible();
  });

  test("mobile stepper navigates to Template and shows templates", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/en");
    await waitForEditor(page);

    await page.getByRole("button", { name: "Template" }).click();
    const editor = page.locator("form");
    await expect(editor.getByText("Basic", { exact: true })).toBeVisible();
    await expect(editor.getByText("Professional", { exact: true })).toBeVisible();
    await expect(editor.getByText("Creative", { exact: true })).toBeVisible();
  });
});
