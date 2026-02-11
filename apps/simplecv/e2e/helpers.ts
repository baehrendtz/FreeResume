import type { Page, BrowserContext } from "@playwright/test";

/**
 * Minimal CV data that satisfies the CvModel zod schema.
 * Used to seed sessionStorage so tests skip onboarding.
 */
export const MINIMAL_CV = {
  name: "Test Person",
  headline: "Software Engineer",
  email: "test@example.com",
  phone: "+46 70 123 4567",
  location: "Stockholm, Sweden",
  linkedIn: "https://linkedin.com/in/testperson",
  website: "https://testperson.dev",
  photo: "",
  summary: "Experienced software engineer with a passion for building great products.",
  experience: [
    {
      title: "Senior Developer",
      company: "Acme Corp",
      location: "Stockholm",
      startDate: "2020-01",
      endDate: "Present",
      description: "Led frontend development team.",
      bullets: ["Built scalable React applications", "Mentored junior developers"],
    },
  ],
  education: [
    {
      institution: "KTH Royal Institute of Technology",
      degree: "M.Sc.",
      field: "Computer Science",
      startDate: "2015-08",
      endDate: "2020-06",
      description: "",
    },
  ],
  skills: ["TypeScript", "React", "Node.js"],
  languages: ["English", "Swedish"],
  extras: [],
  sectionsVisibility: {
    photo: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    languages: true,
    extras: true,
  },
};

const DEFAULT_DISPLAY_SETTINGS = {
  maxExperience: 5,
  maxEducation: 3,
  maxSkills: 12,
  maxBulletsPerJob: 3,
  summaryMaxChars: 300,
  maxExtras: 10,
  simplifyLocations: true,
};

/**
 * Seeds sessionStorage with a minimal CV session so that the app
 * skips onboarding and goes directly to the editor.
 */
export async function seedSession(page: Page) {
  const session = {
    cv: MINIMAL_CV,
    templateId: "basic",
    displaySettings: DEFAULT_DISPLAY_SETTINGS,
  };
  await page.addInitScript((data: string) => {
    window.sessionStorage.setItem("freeresume-session", data);
  }, JSON.stringify(session));
}

/**
 * Pre-sets the cookie-consent cookie so the consent banner does not appear.
 */
export async function dismissCookieConsent(context: BrowserContext) {
  await context.addCookies([
    {
      name: "cookie-consent",
      value: "accepted",
      domain: "localhost",
      path: "/",
    },
  ]);
}

/**
 * Toggles the theme on both desktop and mobile.
 * On mobile the toggle lives inside the "More actions" dropdown menu.
 */
export async function toggleTheme(page: Page, isMobile: boolean | undefined) {
  if (isMobile) {
    // Open the mobile menu first
    await page.getByRole("button", { name: /More actions|Fler åtgärder/ }).click();
    await page.getByRole("menuitem", { name: /Toggle theme|Byt tema/ }).click();
  } else {
    await page.getByRole("button", { name: /Toggle theme|Byt tema/ }).click();
  }
}
