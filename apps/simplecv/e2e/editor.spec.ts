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
    // Scope to the desktop sidebar nav (first nav in the DOM)
    const sidebar = page.locator("nav").first();
    for (const tab of expectedTabs) {
      await expect(
        sidebar.getByRole("button", { name: tab, exact: true })
      ).toBeVisible();
    }
  });

  test("Basics form shows name field with seeded value", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    // Click Basics tab (in sidebar nav)
    await page.locator("nav").first().getByRole("button", { name: "Basics" }).click();

    // The name input should have the seeded value
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

  test("Skills tab shows seeded skills", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Sidebar tabs only visible on desktop");
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Skills" }).click();
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

    // The CV preview should update with the new name
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
    // Scope to the editor area and use exact match to avoid "Basics" tab matching "Basic"
    const editor = page.locator("form");
    await expect(editor.getByText("Basic", { exact: true })).toBeVisible();
    await expect(editor.getByText("Professional", { exact: true })).toBeVisible();
    await expect(editor.getByText("Creative", { exact: true })).toBeVisible();
  });
});
