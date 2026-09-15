import { test, expect } from "@playwright/test";
import { readFile } from "fs/promises";
import { dismissCookieConsent, seedSession, waitForEditor } from "./helpers";

/** Extract all text from a PDF the same way a search engine or ATS would read it. */
async function extractPdfText(path: string): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await readFile(path)) }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n");
}

test.describe("Download and save", () => {
  test.beforeEach(async ({ context, isMobile }) => {
    test.skip(!!isMobile, "Uses the desktop header and sidebar");
    await dismissCookieConsent(context);
  });

  test("downloaded PDF contains searchable text", async ({ page }, testInfo) => {
    await seedSession(page);
    await page.goto("/en");
    await waitForEditor(page);

    const downloadPromise = page.waitForEvent("download");
    await page.locator("header").getByRole("button", { name: "Download PDF" }).click();
    const download = await downloadPromise;
    const pdfPath = testInfo.outputPath("cv.pdf");
    await download.saveAs(pdfPath);

    const text = await extractPdfText(pdfPath);
    expect(text).toContain("Test Person");
    expect(text).toContain("Acme Corp");
  });

  test("a saved CV file can be opened again", async ({ page, browser }, testInfo) => {
    await seedSession(page);
    await page.goto("/en");
    await waitForEditor(page);

    const downloadPromise = page.waitForEvent("download");
    await page.locator("header").getByRole("button", { name: "Save CV file" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Test_Person_CV.json");
    const filePath = testInfo.outputPath("cv.json");
    await download.saveAs(filePath);

    // A fresh browser context has no session, so it starts at onboarding
    const fresh = await browser.newContext({ baseURL: testInfo.project.use.baseURL });
    const freshPage = await fresh.newPage();
    await freshPage.goto("/en");
    await freshPage.locator('input[type="file"]').setInputFiles(filePath);
    await expect(freshPage.getByText("Your CV is ready to edit!")).toBeVisible({ timeout: 15_000 });
    await freshPage.getByRole("button", { name: "Start editing" }).click();
    await expect(freshPage.getByLabel("Full Name")).toHaveValue("Test Person");
    await fresh.close();
  });

  test("checklist points out missing details before download", async ({ page }) => {
    await seedSession(page, { email: "" });
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("header").getByRole("button", { name: "Download PDF" }).click();
    const dialog = page.getByRole("dialog", { name: "Before you download" });
    await expect(dialog.getByText("Email address is missing")).toBeVisible();

    await dialog.getByRole("button", { name: "Fix" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  });

  test("remembers the CV in a new tab only after opting in", async ({ page, context }) => {
    await seedSession(page);
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Settings" }).click();
    await page.getByLabel("Remember my CV in this browser").click();

    // A new tab has empty sessionStorage, so the editor can only come from the remembered copy
    const second = await context.newPage();
    await second.goto("/en");
    await waitForEditor(second);
    await expect(second.getByLabel("Full Name")).toHaveValue("Test Person");
  });

  test("Enter in a bullet point adds a new bullet below", async ({ page }) => {
    await seedSession(page);
    await page.goto("/en");
    await waitForEditor(page);

    await page.locator("nav").first().getByRole("button", { name: "Experience" }).click();
    await page.getByRole("button", { name: /Senior Developer at Acme Corp/ }).click();

    const bullets = page.locator('form textarea[rows="1"]');
    await expect(bullets).toHaveCount(2);
    await bullets.nth(1).press("End");
    await bullets.nth(1).press("Enter");
    await expect(bullets).toHaveCount(3);
    await expect(bullets.nth(2)).toBeFocused();
  });
});
