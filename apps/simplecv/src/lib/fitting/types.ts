import type { SectionsVisibility, LanguageEntry } from "@/lib/model/CvModel";

// --- Template metadata ---

export interface TemplateCapability {
  supportsPhoto: boolean;
  supportsSummary: boolean;
  supportsSkills: boolean;
  supportsLanguages: boolean;
  supportsExtras: boolean;
  supportsSidebar: boolean;
  supportsSecondaryColor: boolean;
}

export interface TemplateContentPolicy {
  /** Section hide order for auto-fit, lower number is hidden first */
  priorities: {
    summary: number;
    experience: number;
    education: number;
    skills: number;
    languages: number;
    extras: number;
  };
  maxBulletChars?: number;
}

export interface TemplateMeta {
  id: string;
  name: string;
  capabilities: TemplateCapability;
  policy: TemplateContentPolicy;
}

// --- RenderModel ---

export interface RenderExperience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
}

export interface RenderExperienceRole {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
}

export interface RenderExperienceGroup {
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  roles: RenderExperienceRole[];
  isSingleRole: boolean;
}

export interface RenderEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface RenderExtrasGroup {
  category: string;
  items: string[];
}

export interface RenderModel {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
  photo: string;
  summary: string;
  experience: RenderExperienceGroup[];
  education: RenderEducation[];
  skills: string[];
  languages: LanguageEntry[];
  extras: RenderExtrasGroup[];
  cvLanguage: "en" | "sv";
  sectionsVisibility: SectionsVisibility;
}

// --- Layout metrics ---

export interface LayoutMetrics {
  fits: boolean;
  estimatedPages: number;
}

// --- Auto-fit result ---

export interface FitResult {
  displaySettings: DisplaySettings;
  visibilityOverrides: Partial<SectionsVisibility>;
}

// Re-export for convenience (avoid circular dep, use type-only)
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
