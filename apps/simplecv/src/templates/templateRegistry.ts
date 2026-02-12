import { lazy, type ComponentType } from "react";
import type { RenderModel, TemplateMeta } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";

export interface TemplateEntry {
  name: string;
  component: React.LazyExoticComponent<ComponentType<{ cv: RenderModel; styleSettings?: TemplateStyleValues }>>;
  meta: TemplateMeta;
  defaultStyle: TemplateStyleValues;
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
    supportsSecondaryColor: false,
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
    supportsSecondaryColor: false,
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
    supportsSecondaryColor: false,
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
    supportsSecondaryColor: true,
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

const basicDefaultStyle: TemplateStyleValues = {
  accentColor: "#0d9488",
  secondaryColor: "#0d9488",
  photoSizePx: 64,
  fontSizePercent: 100,
  photoShape: "circle",
  sidebarBgColor: "#f1f5f9",
  lineHeightPercent: 100,
};

const professionalDefaultStyle: TemplateStyleValues = {
  accentColor: "#1a1a2e",
  secondaryColor: "#1a1a2e",
  photoSizePx: 80,
  fontSizePercent: 100,
  photoShape: "circle",
  sidebarBgColor: "#f1f5f9",
  lineHeightPercent: 100,
};

const basic2DefaultStyle: TemplateStyleValues = {
  accentColor: "#4a6fa5",
  secondaryColor: "#4a6fa5",
  photoSizePx: 128,
  fontSizePercent: 100,
  photoShape: "circle",
  sidebarBgColor: "#dce4ed",
  lineHeightPercent: 100,
};

const creativeDefaultStyle: TemplateStyleValues = {
  accentColor: "#06b6d4",
  secondaryColor: "#8b5cf6",
  photoSizePx: 64,
  fontSizePercent: 100,
  photoShape: "circle",
  sidebarBgColor: "#f8fafc",
  lineHeightPercent: 100,
};

export const templates: Record<string, TemplateEntry> = {
  basic: {
    name: "Basic",
    component: lazy(() => import("./TemplateBasic")),
    meta: basicMeta,
    defaultStyle: basicDefaultStyle,
  },
  professional: {
    name: "Professional",
    component: lazy(() => import("./TemplateProfessional")),
    meta: professionalMeta,
    defaultStyle: professionalDefaultStyle,
  },
  basic2: {
    name: "Basic 2",
    component: lazy(() => import("./TemplateBasic2")),
    meta: basic2Meta,
    defaultStyle: basic2DefaultStyle,
  },
  creative: {
    name: "Creative",
    component: lazy(() => import("./TemplateCreative")),
    meta: creativeMeta,
    defaultStyle: creativeDefaultStyle,
  },
};

export function getTemplateMeta(templateId: string): TemplateMeta {
  return templates[templateId]?.meta ?? templates.basic.meta;
}

export function getTemplateDefaultStyle(templateId: string): TemplateStyleValues {
  return templates[templateId]?.defaultStyle ?? templates.basic.defaultStyle;
}
