import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { TemplateMeta, LayoutMetrics, FitResult } from "./types";

/**
 * Pure function that returns the *first applicable* reduction to make
 * the CV fit on one page. Returns `null` if it already fits or no
 * more reductions are possible.
 *
 * Call iteratively: apply the result, re-measure, call again until null.
 */
export function fitToTemplate(
  cv: CvModel,
  meta: TemplateMeta,
  settings: DisplaySettings,
  metrics: LayoutMetrics,
): FitResult | null {
  if (metrics.fits) return null;

  const vis = cv.sectionsVisibility;

  // --- Phase 1: Trim reductions (ordered) ---

  // 1. Reduce bullets per job
  if (settings.maxBulletsPerJob > 1) {
    return {
      displaySettings: { ...settings, maxBulletsPerJob: settings.maxBulletsPerJob - 1 },
      visibilityOverrides: {},
    };
  }

  // 2. Reduce summary length
  if (settings.summaryMaxChars > 100 && vis.summary && cv.summary.length > 0) {
    return {
      displaySettings: {
        ...settings,
        summaryMaxChars: Math.max(100, settings.summaryMaxChars - 100),
      },
      visibilityOverrides: {},
    };
  }

  // 3. Reduce skills count
  if (settings.maxSkills > 4 && vis.skills && cv.skills.length > 4) {
    return {
      displaySettings: {
        ...settings,
        maxSkills: Math.max(4, settings.maxSkills - 3),
      },
      visibilityOverrides: {},
    };
  }

  // 4. Reduce education count
  if (settings.maxEducation > 1 && vis.education && cv.education.length > 1) {
    return {
      displaySettings: { ...settings, maxEducation: settings.maxEducation - 1 },
      visibilityOverrides: {},
    };
  }

  // 5. Reduce experience count
  if (settings.maxExperience > 2 && vis.experience && cv.experience.length > 2) {
    return {
      displaySettings: { ...settings, maxExperience: settings.maxExperience - 1 },
      visibilityOverrides: {},
    };
  }

  // --- Phase 2: Hide sections by ascending priority ---

  const priorities = meta.policy.priorities;
  const sortedSections = (
    Object.entries(priorities) as [keyof typeof priorities, number][]
  )
    .sort((a, b) => a[1] - b[1]);

  for (const [section] of sortedSections) {
    // Never fully hide experience
    if (section === "experience") continue;
    if (vis[section]) {
      return {
        displaySettings: settings,
        visibilityOverrides: { [section]: false },
      };
    }
  }

  // --- Phase 3: Last-resort reductions ---

  // 7. Remove all bullets
  if (settings.maxBulletsPerJob > 0) {
    return {
      displaySettings: { ...settings, maxBulletsPerJob: 0 },
      visibilityOverrides: {},
    };
  }

  // 8. Minimize experience to 1
  if (settings.maxExperience > 1) {
    return {
      displaySettings: { ...settings, maxExperience: 1 },
      visibilityOverrides: {},
    };
  }

  // Nothing left to reduce
  return null;
}
