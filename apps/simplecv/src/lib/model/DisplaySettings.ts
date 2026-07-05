import type { CvModel } from "./CvModel";
import type { RenderModel } from "@/lib/fitting/types";

export type PageTarget = 1 | 2;

export interface DisplaySettings {
  pageTarget: PageTarget;
  maxExperience: number;
  maxEducation: number;
  maxSkills: number;
  maxBulletsPerJob: number;
  summaryMaxChars: number;
  maxExtras: number;
  simplifyLocations: boolean;
  cvLanguage: "en" | "sv";
}

export const defaultDisplaySettings: DisplaySettings = {
  pageTarget: 1,
  maxExperience: 5,
  maxEducation: 3,
  maxSkills: 12,
  maxBulletsPerJob: 3,
  summaryMaxChars: 300,
  maxExtras: 10,
  simplifyLocations: true,
  cvLanguage: "en",
};

/** Content limits used when user selects 1-page mode. Only limit fields ,
 *  must not touch unrelated settings like cvLanguage or simplifyLocations. */
export const onePageDisplayDefaults: Partial<DisplaySettings> = {
  pageTarget: 1,
  maxExperience: 5,
  maxEducation: 3,
  maxSkills: 12,
  maxBulletsPerJob: 3,
  summaryMaxChars: 300,
  maxExtras: 10,
};

/** Higher limits used when user selects 2-page mode */
export const twoPageDisplayDefaults: Partial<DisplaySettings> = {
  pageTarget: 2,
  maxExperience: 10,
  maxEducation: 5,
  maxSkills: 20,
  maxBulletsPerJob: 5,
  summaryMaxChars: 600,
  maxExtras: 20,
};

export interface TrimCount {
  shown: number;
  total: number;
}

export interface TrimInfo {
  experience: TrimCount;
  education: TrimCount;
  skills: TrimCount;
  extras: TrimCount;
  summaryTruncated: boolean;
  anyTrimmed: boolean;
}

/**
 * Compares original CV data against the derived RenderModel to determine
 * what content was trimmed by the fitting pipeline. Sections the user has
 * toggled off (or the template doesn't support) are not counted as trimmed.
 */
export function computeTrimInfo(cv: CvModel, renderModel: RenderModel): TrimInfo {
  const vis = renderModel.sectionsVisibility;

  const count = (visible: boolean, shown: number, total: number): TrimCount =>
    visible ? { shown, total } : { shown: 0, total: 0 };

  // Count individual roles rendered (not groups) to compare against visible entries
  const experience = count(
    vis.experience,
    renderModel.experience.reduce((sum, g) => sum + g.roles.length, 0),
    cv.experience.filter((e) => !e.hidden).length,
  );
  const education = count(
    vis.education,
    renderModel.education.length,
    cv.education.filter((e) => !e.hidden).length,
  );
  const skills = count(vis.skills, renderModel.skills.length, cv.skills.length);
  const extras = count(
    vis.extras,
    renderModel.extras.reduce((sum, g) => sum + g.items.length, 0),
    cv.extras.reduce((sum, g) => sum + g.items.length, 0),
  );
  // Compare content, not lengths, the "…" suffix makes a truncated summary
  // the same length as the original at the boundary.
  const summaryTruncated =
    vis.summary && cv.summary.length > 0 && renderModel.summary !== cv.summary;

  const isTrimmed = (c: TrimCount) => c.shown < c.total;

  return {
    experience,
    education,
    skills,
    extras,
    summaryTruncated,
    anyTrimmed:
      isTrimmed(experience) ||
      isTrimmed(education) ||
      isTrimmed(skills) ||
      isTrimmed(extras) ||
      summaryTruncated,
  };
}
