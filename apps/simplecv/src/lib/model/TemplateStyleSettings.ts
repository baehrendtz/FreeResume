export interface TemplateStyleValues {
  accentColor: string;
  photoSizePx: number;
  fontSizePercent: number;
}

export type PerTemplateStyleOverrides = Record<string, Partial<TemplateStyleValues>>;

export function resolveStyleSettings(
  templateId: string,
  defaults: TemplateStyleValues,
  overrides: PerTemplateStyleOverrides,
): TemplateStyleValues {
  return { ...defaults, ...overrides[templateId] };
}
