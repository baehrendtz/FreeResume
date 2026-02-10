import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { TemplateMeta, RenderModel } from "./types";

function simplifyLocation(loc: string): string {
  const parts = loc.split(", ");
  if (parts.length >= 3) {
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  }
  return loc;
}

/**
 * Builds a render-ready model from CvModel + template metadata + user display settings.
 * Pure function — no side effects, no mutations of the input.
 *
 * Application order:
 *   1. Template capabilities (e.g. no photo in Basic)
 *   2. Sections visibility toggles
 *   3. DisplaySettings limits (user-configured)
 *   4. Template policy limits (take the stricter of user vs template)
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
  const photo = capabilities.supportsPhoto ? cv.photo : "";

  // --- 2 + 3 + 4. Section data with visibility + limits ---

  // Summary: respect capability, visibility, then truncate
  let summary = "";
  if (capabilities.supportsSummary && vis.summary && cv.summary) {
    const maxChars = policy.maxSummaryChars != null
      ? Math.min(settings.summaryMaxChars, policy.maxSummaryChars)
      : settings.summaryMaxChars;
    summary = cv.summary.length > maxChars
      ? cv.summary.slice(0, maxChars).trimEnd() + "..."
      : cv.summary;
  }

  // Experience: respect visibility, then slice, then truncate bullets
  let experience: RenderModel["experience"] = [];
  if (vis.experience) {
    const maxItems = policy.maxExperienceItems != null
      ? Math.min(settings.maxExperience, policy.maxExperienceItems)
      : settings.maxExperience;

    experience = cv.experience.filter((exp) => !exp.hidden).slice(0, maxItems).map((exp) => {
      const bullets = exp.bullets.slice(0, settings.maxBulletsPerJob).map((b) => {
        if (policy.maxBulletChars != null && b.length > policy.maxBulletChars) {
          return b.slice(0, policy.maxBulletChars).trimEnd() + "…";
        }
        return b;
      });

      return {
        title: exp.title,
        company: exp.company,
        location: settings.simplifyLocations ? simplifyLocation(exp.location) : exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        bullets,
      };
    });
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
      ? [...cv.languages]
      : [];

  // Extras: respect capability + visibility, then slice across groups
  let extras: RenderModel["extras"] = [];
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
    sectionsVisibility: {
      summary: vis.summary && capabilities.supportsSummary,
      experience: vis.experience,
      education: vis.education,
      skills: vis.skills && capabilities.supportsSkills,
      languages: vis.languages && capabilities.supportsLanguages,
      extras: vis.extras && capabilities.supportsExtras,
    },
  };
}
