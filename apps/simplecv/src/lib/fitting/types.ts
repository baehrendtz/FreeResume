import type { SectionsVisibility } from "@/lib/model/CvModel";

// --- Template metadata ---

export type PageTarget = 1 | 2 | 3 | "auto";

export interface TemplateCapability {
  supportsPhoto: boolean;
  supportsSummary: boolean;
  supportsSkills: boolean;
  supportsLanguages: boolean;
  supportsExtras: boolean;
  supportsSidebar: boolean;
}

export interface TemplateContentPolicy {
  pageTarget: PageTarget;
  hardOnePage: boolean;
  overflowStrategy: "truncate" | "hideLowestPriority" | "allowPages";
  defaultVisibility: SectionsVisibility;
  priorities: {
    summary: number;
    experience: number;
    education: number;
    skills: number;
    languages: number;
    extras: number;
  };
  experienceItemPriority: "recentFirst" | "asIs";
  maxExperienceItems?: number;
  maxSummaryChars?: number;
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
  experience: RenderExperience[];
  education: RenderEducation[];
  skills: string[];
  languages: string[];
  extras: RenderExtrasGroup[];
  sectionsVisibility: SectionsVisibility;
}

// --- Layout metrics ---

export interface LayoutMetrics {
  fits: boolean;
  contentHeightPx: number;
  pageHeightPx: number;
  overflowPx: number;
  estimatedPages: number;
}

// --- Auto-fit result ---

export interface FitResult {
  displaySettings: DisplaySettings;
  visibilityOverrides: Partial<SectionsVisibility>;
}

// Re-export for convenience (avoid circular dep – use type-only)
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
