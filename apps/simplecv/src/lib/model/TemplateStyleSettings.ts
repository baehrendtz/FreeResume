export interface TemplateStyleValues {
  accentColor: string;
  secondaryColor: string;
  photoSizePx: number;
  fontSizePercent: number;
  photoShape: "circle" | "rounded" | "square";
  sidebarBgColor: string;
  lineHeightPercent: number;
}

export type PerTemplateStyleOverrides = Record<string, Partial<TemplateStyleValues>>;

export function resolveStyleSettings(
  templateId: string,
  defaults: TemplateStyleValues,
  overrides: PerTemplateStyleOverrides,
): TemplateStyleValues {
  return { ...defaults, ...overrides[templateId] };
}
