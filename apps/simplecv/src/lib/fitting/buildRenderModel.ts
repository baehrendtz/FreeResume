import type { CvModel, Experience } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { TemplateMeta, RenderModel, RenderExperienceGroup, RenderExperienceRole } from "./types";

function simplifyLocation(loc: string): string {
  const parts = loc.split(", ");
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  }
  return loc;
}

/**
 * Assign auto groupIds to entries that lack them, based on consecutive same company name.
 */
function assignAutoGroupIds(entries: Experience[]): (Experience & { effectiveGroupId: string })[] {
  let currentGroupId = crypto.randomUUID();
  return entries.map((entry, i) => {
    if (entry.companyGroupId) {
      return { ...entry, effectiveGroupId: entry.companyGroupId };
    }
    // Auto-group: consecutive entries with same company name
    if (i > 0 && entry.company === entries[i - 1].company && entry.company) {
      return { ...entry, effectiveGroupId: currentGroupId };
    }
    currentGroupId = crypto.randomUUID();
    return { ...entry, effectiveGroupId: currentGroupId };
  });
}

/**
 * Group experience entries into RenderExperienceGroup[] for template rendering.
 */
function groupExperienceEntries(
  entries: Experience[],
  settings: DisplaySettings,
  maxBulletChars?: number,
): RenderExperienceGroup[] {
  const withIds = assignAutoGroupIds(entries);
  const groups: RenderExperienceGroup[] = [];
  let currentGroupId: string | null = null;
  let currentGroup: RenderExperienceGroup | null = null;

  for (const entry of withIds) {
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

    if (entry.effectiveGroupId === currentGroupId && currentGroup) {
      // Add role to existing group
      currentGroup.roles.push(role);
      currentGroup.isSingleRole = false;
      // Expand date range
      if (entry.startDate && (!currentGroup.startDate || entry.startDate < currentGroup.startDate)) {
        currentGroup.startDate = entry.startDate;
      }
      if (entry.endDate && (!currentGroup.endDate || entry.endDate > currentGroup.endDate)) {
        currentGroup.endDate = entry.endDate;
      }
      // If any role has no endDate (current), the group endDate should also be empty (present)
      if (!entry.endDate) {
        currentGroup.endDate = "";
      }
    } else {
      // Start new group
      if (currentGroup) groups.push(currentGroup);
      currentGroupId = entry.effectiveGroupId;
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
