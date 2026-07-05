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

  // Every reduction below must actually change rendered content, a no-op
  // "reduction" burns one of MAX_FIT_ITERATIONS without shrinking anything,
  // and enough of them makes auto-fit give up before doing real work.

  // --- Phase 1: Trim reductions (ordered) ---

  // 1. Reduce bullets per job, only if some visible entry renders that many bullets
  const hasBulletsAtLimit =
    vis.experience &&
    cv.experience.some((e) => !e.hidden && e.bullets.length >= settings.maxBulletsPerJob);
  if (settings.maxBulletsPerJob > 1 && hasBulletsAtLimit) {
    return {
      displaySettings: { ...settings, maxBulletsPerJob: settings.maxBulletsPerJob - 1 },
      visibilityOverrides: {},
    };
  }

  // 2. Reduce summary length, only if the new limit actually truncates more
  if (
    settings.summaryMaxChars > 100 &&
    vis.summary &&
    cv.summary.length > settings.summaryMaxChars - 100
  ) {
    return {
      displaySettings: {
        ...settings,
        summaryMaxChars: Math.max(100, settings.summaryMaxChars - 100),
      },
      visibilityOverrides: {},
    };
  }

  // 3. Reduce skills count, only if more skills than the new limit exist
  if (settings.maxSkills > 4 && vis.skills && cv.skills.length > Math.max(4, settings.maxSkills - 3)) {
    return {
      displaySettings: {
        ...settings,
        maxSkills: Math.max(4, settings.maxSkills - 3),
      },
      visibilityOverrides: {},
    };
  }

  // 4. Reduce education count, only when the current limit is actually in use
  const visibleEducationCount = cv.education.filter((e) => !e.hidden).length;
  if (settings.maxEducation > 1 && vis.education && visibleEducationCount >= settings.maxEducation) {
    return {
      displaySettings: { ...settings, maxEducation: settings.maxEducation - 1 },
      visibilityOverrides: {},
    };
  }

  // 5. Reduce experience count (count consecutive groups, matching buildRenderModel's
  // grouping where entries without an ID each form their own group)
  const visible = cv.experience.filter((e) => !e.hidden);
  let visibleGroupCount = 0;
  let lastGroupId: string | null = null;
  for (const e of visible) {
    const groupId = e.companyGroupId ?? null;
    if (groupId === null || groupId !== lastGroupId) {
      visibleGroupCount++;
    }
    lastGroupId = groupId;
  }
  if (settings.maxExperience > 2 && vis.experience && visibleGroupCount >= settings.maxExperience) {
    return {
      displaySettings: { ...settings, maxExperience: settings.maxExperience - 1 },
      visibilityOverrides: {},
    };
  }

  // 6. Remove last bullet per job (less destructive than hiding sections)
  const hasRenderedBullets =
    vis.experience && cv.experience.some((e) => !e.hidden && e.bullets.length > 0);
  if (settings.maxBulletsPerJob > 0 && hasRenderedBullets) {
    return {
      displaySettings: { ...settings, maxBulletsPerJob: 0 },
      visibilityOverrides: {},
    };
  }

  // 7. Reduce extras count, only if more items than the new limit exist
  const totalExtrasItems = cv.extras.reduce((sum, g) => sum + g.items.length, 0);
  if (settings.maxExtras > 1 && vis.extras && totalExtrasItems > Math.max(1, settings.maxExtras - 3)) {
    return {
      displaySettings: { ...settings, maxExtras: Math.max(1, settings.maxExtras - 3) },
      visibilityOverrides: {},
    };
  }

  // --- Phase 2: Hide sections by ascending priority ---

  const sectionHasContent: Record<keyof TemplateMeta["policy"]["priorities"], boolean> = {
    summary: cv.summary.length > 0,
    experience: cv.experience.some((e) => !e.hidden),
    education: cv.education.some((e) => !e.hidden),
    skills: cv.skills.length > 0,
    languages: cv.languages.length > 0,
    extras: totalExtrasItems > 0,
  };

  const priorities = meta.policy.priorities;
  const sortedSections = (
    Object.entries(priorities) as [keyof typeof priorities, number][]
  )
    .sort((a, b) => a[1] - b[1]);

  for (const [section] of sortedSections) {
    // Never fully hide experience
    if (section === "experience") continue;
    // Hiding an empty section frees no space
    if (vis[section] && sectionHasContent[section]) {
      return {
        displaySettings: settings,
        visibilityOverrides: { [section]: false },
      };
    }
  }

  // --- Phase 3: Last-resort reductions ---

  // 8. Minimize experience to 1
  if (settings.maxExperience > 1 && visibleGroupCount > 1) {
    return {
      displaySettings: { ...settings, maxExperience: 1 },
      visibilityOverrides: {},
    };
  }

  // Nothing left to reduce
  return null;
}
