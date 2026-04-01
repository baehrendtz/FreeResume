import type { CvModel, Experience } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { TemplateMeta, RenderModel, RenderExperienceGroup, RenderExperienceRole } from "./types";
import { MONTH_LOOKUP } from "@/lib/cvLocale";

/**
 * Parse a free-text date string like "Jan 2020" or "2020" into a comparable
 * number (year * 12 + month). Returns null if the format is unrecognized.
 */
function parseDateToMonths(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Year only, e.g. "2020"
  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) return Number(yearOnly[1]) * 12;

  // "Month Year" pattern, e.g. "Jan 2020" or "Oktober 2020"
  const monthYear = trimmed.match(/^([A-Za-z\u00C0-\u00F6\u00F8-\u00FF]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = MONTH_LOOKUP[monthYear[1].toLowerCase()];
    if (month) return Number(monthYear[2]) * 12 + month;
  }

  return null;
}

/** Compare two date strings. Returns negative if a < b, positive if a > b, 0 if equal. */
function compareDateStrings(a: string, b: string): number {
  const am = parseDateToMonths(a);
  const bm = parseDateToMonths(b);
  if (am != null && bm != null) return am - bm;
  // Fallback to lexicographic comparison if parsing fails
  return a < b ? -1 : a > b ? 1 : 0;
}

function simplifyLocation(loc: string): string {
  const parts = loc.split(", ");
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  }
  return loc;
}

/**
 * Group experience entries into RenderExperienceGroup[] for template rendering.
 */
function groupExperienceEntries(
  entries: Experience[],
  settings: DisplaySettings,
  maxBulletChars?: number,
): RenderExperienceGroup[] {
  // Assumes entries already have companyGroupId assigned (via migration or parser).
  const groups: RenderExperienceGroup[] = [];
  let currentGroupId: string | null = null;
  let currentGroup: RenderExperienceGroup | null = null;

  for (const entry of entries) {
    const role: RenderExperienceRole = {
      title: entry.title,
      location: settings.simplifyLocations ? simplifyLocation(entry.location) : entry.location,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
      bullets: entry.bullets.slice(0, settings.maxBulletsPerJob).map((b) => {
        if (maxBulletChars != null && b.length > maxBulletChars) {
          return b.slice(0, maxBulletChars).trimEnd() + "…";
        }
        return b;
      }),
    };

    if (entry.companyGroupId === currentGroupId && currentGroup) {
      // Add role to existing group
      currentGroup.roles.push(role);
      currentGroup.isSingleRole = false;
      // Expand date range: track earliest start and latest end
      if (entry.startDate && (!currentGroup.startDate || compareDateStrings(entry.startDate, currentGroup.startDate) < 0)) {
        currentGroup.startDate = entry.startDate;
      }
      if (!entry.endDate) {
        // Ongoing role — group is also ongoing
        currentGroup.endDate = "";
      } else if (currentGroup.endDate !== "" && (!currentGroup.endDate || compareDateStrings(entry.endDate, currentGroup.endDate) > 0)) {
        // Only update endDate if the group isn't already marked as ongoing
        currentGroup.endDate = entry.endDate;
      }
    } else {
      // Start new group
      if (currentGroup) groups.push(currentGroup);
      currentGroupId = entry.companyGroupId ?? null;
      currentGroup = {
        company: entry.company,
        location: settings.simplifyLocations ? simplifyLocation(entry.location) : entry.location,
        startDate: entry.startDate,
        endDate: entry.endDate,
        roles: [role],
        isSingleRole: true,
      };
    }
  }

  if (currentGroup) groups.push(currentGroup);
  return groups;
}

/**
 * Builds a render-ready model from CvModel + template metadata + user display settings.
 * Pure function — no side effects, no mutations of the input.
 *
 * Application order:
 *   1. Template capabilities (e.g. no photo in Basic)
 *   2. Sections visibility toggles
 *   3. DisplaySettings limits (user-configured)
 *   4. Template policy limits (experience items, bullet chars)
 *   5. Bullet text truncation
 */
export function buildRenderModel(
  cv: CvModel,
  meta: TemplateMeta,
  settings: DisplaySettings,
): RenderModel {
  const { capabilities, policy } = meta;
  const vis = cv.sectionsVisibility;

  // --- 1. Template capabilities ---
  const photo = capabilities.supportsPhoto && vis.photo ? cv.photo : "";

  // --- 2 + 3 + 4. Section data with visibility + limits ---

  // Summary: respect capability, visibility, then truncate
  let summary = "";
  if (capabilities.supportsSummary && vis.summary && cv.summary) {
    const maxChars = settings.summaryMaxChars;
    summary = cv.summary.length > maxChars
      ? cv.summary.slice(0, maxChars).trimEnd() + "…"
      : cv.summary;
  }

  // Experience: respect visibility, group by companyGroupId, then slice groups, then truncate bullets
  let experience: RenderModel["experience"] = [];
  if (vis.experience) {
    const maxGroups = policy.maxExperienceItems != null
      ? Math.min(settings.maxExperience, policy.maxExperienceItems)
      : settings.maxExperience;

    const visibleEntries = cv.experience.filter((exp) => !exp.hidden);

    // Group consecutive entries by companyGroupId (or auto-group by consecutive same company)
    const groups = groupExperienceEntries(visibleEntries, settings, policy.maxBulletChars);
    experience = groups.slice(0, maxGroups);
  }

  // Education: respect visibility, then slice
  let education: RenderModel["education"] = [];
  if (vis.education) {
    education = cv.education.filter((edu) => !edu.hidden).slice(0, settings.maxEducation).map((edu) => ({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description,
    }));
  }

  // Skills: respect capability + visibility, then slice
  const skills =
    capabilities.supportsSkills && vis.skills
      ? cv.skills.slice(0, settings.maxSkills)
      : [];

  // Languages: respect capability + visibility
  const languages =
    capabilities.supportsLanguages && vis.languages
      ? cv.languages.map((l) => ({ name: l.name, level: l.level }))
      : [];

  // Extras: respect capability + visibility, then slice across groups
  const extras: RenderModel["extras"] = [];
  if (capabilities.supportsExtras && vis.extras) {
    let remaining = settings.maxExtras;
    for (const group of cv.extras ?? []) {
      if (remaining <= 0) break;
      const sliced = group.items.slice(0, remaining);
      if (sliced.length > 0) {
        extras.push({ category: group.category, items: sliced });
        remaining -= sliced.length;
      }
    }
  }

  return {
    name: cv.name,
    headline: cv.headline,
    email: cv.email,
    phone: cv.phone,
    location: settings.simplifyLocations ? simplifyLocation(cv.location) : cv.location,
    linkedIn: cv.linkedIn,
    website: cv.website,
    photo,
    summary,
    experience,
    education,
    skills,
    languages,
    extras,
    cvLanguage: settings.cvLanguage ?? "en",
    sectionsVisibility: {
      photo: vis.photo && capabilities.supportsPhoto,
      summary: vis.summary && capabilities.supportsSummary,
      experience: vis.experience,
      education: vis.education,
      skills: vis.skills && capabilities.supportsSkills,
      languages: vis.languages && capabilities.supportsLanguages,
      extras: vis.extras && capabilities.supportsExtras,
    },
  };
}
