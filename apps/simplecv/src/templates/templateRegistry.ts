import { lazy, type ComponentType } from "react";
import type { RenderModel, TemplateMeta } from "@/lib/fitting/types";

export interface TemplateEntry {
  name: string;
  component: React.LazyExoticComponent<ComponentType<{ cv: RenderModel }>>;
  meta: TemplateMeta;
}

const professionalMeta: TemplateMeta = {
  id: "professional",
  name: "Professional",
  capabilities: {
    supportsPhoto: true,
    supportsSummary: true,
    supportsSkills: true,
    supportsLanguages: true,
    supportsExtras: true,
    supportsSidebar: true,
  },
  policy: {
    pageTarget: 1,
    hardOnePage: true,
    overflowStrategy: "truncate",
    defaultVisibility: {
      photo: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      languages: true,
      extras: true,
    },
    priorities: {
      experience: 5,
      education: 4,
      summary: 3,
      skills: 2,
      extras: 1,
      languages: 1,
    },
    experienceItemPriority: "recentFirst",
    maxSummaryChars: 400,
    maxBulletChars: 200,
  },
};

const basicMeta: TemplateMeta = {
  id: "basic",
  name: "Basic",
  capabilities: {
    supportsPhoto: true,
    supportsSummary: true,
    supportsSkills: true,
    supportsLanguages: true,
    supportsExtras: true,
    supportsSidebar: false,
  },
  policy: {
    pageTarget: 1,
    hardOnePage: true,
    overflowStrategy: "truncate",
    defaultVisibility: {
      photo: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      languages: true,
      extras: true,
    },
    priorities: {
      experience: 5,
      education: 4,
      summary: 3,
      skills: 2,
      extras: 1,
      languages: 1,
    },
    experienceItemPriority: "recentFirst",
    maxSummaryChars: 300,
    maxBulletChars: 150,
  },
};

const basic2Meta: TemplateMeta = {
  id: "basic2",
  name: "Basic 2",
  capabilities: {
    supportsPhoto: true,
    supportsSummary: true,
    supportsSkills: true,
    supportsLanguages: true,
    supportsExtras: true,
    supportsSidebar: true,
  },
  policy: {
    pageTarget: 1,
    hardOnePage: true,
    overflowStrategy: "truncate",
    defaultVisibility: {
      photo: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      languages: true,
      extras: true,
    },
    priorities: {
      experience: 5,
      education: 4,
      summary: 3,
      skills: 2,
      extras: 1,
      languages: 1,
    },
    experienceItemPriority: "recentFirst",
    maxSummaryChars: 350,
    maxBulletChars: 180,
  },
};

const creativeMeta: TemplateMeta = {
  id: "creative",
  name: "Creative",
  capabilities: {
    supportsPhoto: true,
    supportsSummary: true,
    supportsSkills: true,
    supportsLanguages: true,
    supportsExtras: true,
    supportsSidebar: true,
  },
  policy: {
    pageTarget: 1,
    hardOnePage: true,
    overflowStrategy: "truncate",
    defaultVisibility: {
      photo: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      languages: true,
      extras: true,
    },
    priorities: {
      experience: 5,
      education: 4,
      summary: 3,
      skills: 2,
      extras: 1,
      languages: 1,
    },
    experienceItemPriority: "recentFirst",
    maxSummaryChars: 350,
    maxBulletChars: 180,
  },
};

export const templates: Record<string, TemplateEntry> = {
  basic: {
    name: "Basic",
    component: lazy(() => import("./TemplateBasic")),
    meta: basicMeta,
  },
  professional: {
    name: "Professional",
    component: lazy(() => import("./TemplateProfessional")),
    meta: professionalMeta,
  },
  basic2: {
    name: "Basic 2",
    component: lazy(() => import("./TemplateBasic2")),
    meta: basic2Meta,
  },
  creative: {
    name: "Creative",
    component: lazy(() => import("./TemplateCreative")),
    meta: creativeMeta,
  },
};

export function getTemplateMeta(templateId: string): TemplateMeta {
  return templates[templateId]?.meta ?? templates.basic.meta;
}
