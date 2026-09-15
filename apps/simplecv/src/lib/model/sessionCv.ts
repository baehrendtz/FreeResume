import { z } from "zod/v4";
import { type CvModel, createEmptyCvModel, cvModelSchema } from "@/lib/model/CvModel";
import { findLanguageId } from "@/lib/cvLocale";
import { assignCompanyGroupIds } from "@/lib/model/groupExperience";

function migrateExtras(cv: CvModel): CvModel {
  const extras = cv.extras as unknown;
  if (Array.isArray(extras) && extras.length > 0 && typeof extras[0] === "string") {
    return { ...cv, extras: [{ category: "other", items: extras as string[] }] };
  }
  return cv;
}

function migrateLanguages(cv: CvModel): CvModel {
  const languages = cv.languages as unknown;
  if (Array.isArray(languages) && languages.length > 0 && typeof languages[0] === "string") {
    return {
      ...cv,
      languages: (languages as string[]).map((name) => ({
        name,
        level: "professional_working" as const,
      })),
    };
  }
  return cv;
}

function migrateCompanyGroups(cv: CvModel): CvModel {
  if (cv.experience.some((e) => e.companyGroupId)) return cv;
  return { ...cv, experience: assignCompanyGroupIds(cv.experience) };
}

function migrateLanguageNames(cv: CvModel): CvModel {
  const changed = cv.languages.map((lang) => {
    const id = findLanguageId(lang.name);
    return id ? { ...lang, name: id } : lang;
  });
  return { ...cv, languages: changed };
}

// Same shape as cvModelSchema but without the min-length requirement on name,
// in-progress sessions are legitimately saved before a name has been typed.
const sessionCvSchema = cvModelSchema.extend({ name: z.string() });

/** Migrate + validate a stored CV (session or saved file). Returns null if the data is unusable. */
export function parseSessionCv(raw: CvModel): CvModel | null {
  const empty = createEmptyCvModel();
  // Heal missing fields from older sessions before strict validation
  const healed = {
    ...empty,
    ...raw,
    sectionsVisibility: { ...empty.sectionsVisibility, ...(raw.sectionsVisibility ?? {}) },
  };
  const migrated = [migrateExtras, migrateLanguages, migrateLanguageNames, migrateCompanyGroups]
    .reduce((model, fn) => fn(model), healed);
  const result = sessionCvSchema.safeParse(migrated);
  if (!result.success) {
    console.error("Discarding invalid saved CV:", result.error);
    return null;
  }
  return result.data;
}
