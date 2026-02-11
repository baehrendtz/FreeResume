import type { CvModel } from "./CvModel";
import type { RenderModel } from "@/lib/fitting/types";

export interface DisplaySettings {
  maxExperience: number;
  maxEducation: number;
  maxSkills: number;
  maxBulletsPerJob: number;
  summaryMaxChars: number;
  maxExtras: number;
  simplifyLocations: boolean;
}

export const defaultDisplaySettings: DisplaySettings = {
  maxExperience: 5,
  maxEducation: 3,
  maxSkills: 12,
  maxBulletsPerJob: 3,
  summaryMaxChars: 300,
  maxExtras: 10,
  simplifyLocations: true,
};

export interface TrimInfo {
  experienceHidden: number;
  educationHidden: number;
  skillsHidden: number;
  extrasHidden: number;
  summaryTruncated: boolean;
  anyTrimmed: boolean;
}

/**
 * Compares original CV data against the derived RenderModel to determine
 * what content was trimmed by the fitting pipeline.
 */
export function computeTrimInfo(cv: CvModel, renderModel: RenderModel): TrimInfo {
  const experienceHidden = Math.max(
    0,
    cv.experience.length - renderModel.experience.length,
  );
  const educationHidden = Math.max(
    0,
    cv.education.length - renderModel.education.length,
  );
  const skillsHidden = Math.max(
    0,
    cv.skills.length - renderModel.skills.length,
  );
  const totalCvExtras = (cv.extras ?? []).reduce((sum, g) => sum + g.items.length, 0);
  const totalRenderExtras = (renderModel.extras ?? []).reduce((sum, g) => sum + g.items.length, 0);
  const extrasHidden = Math.max(0, totalCvExtras - totalRenderExtras);
  const summaryTruncated =
    cv.summary.length > 0 &&
    renderModel.summary.length < cv.summary.length;

  return {
    experienceHidden,
    educationHidden,
    skillsHidden,
    extrasHidden,
    summaryTruncated,
    anyTrimmed:
      experienceHidden > 0 ||
      educationHidden > 0 ||
      skillsHidden > 0 ||
      extrasHidden > 0 ||
      summaryTruncated,
  };
}
