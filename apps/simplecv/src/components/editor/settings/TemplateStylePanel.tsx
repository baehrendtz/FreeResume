"use client";

import { useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { SettingsSection } from "./SettingsSection";
import { FONT_SIZE_RANGE, PHOTO_SIZE_RANGE, LINE_HEIGHT_RANGE } from "@/lib/constants";
import type { PerTemplateStyleOverrides, TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";

export interface StyleLabels {
  styleTitle: string;
  styleDescription: string;
  accentColor: string;
  secondaryColor: string;
  photoSize: string;
  fontScale: string;
  photoShape: string;
  photoShapeCircle: string;
  photoShapeRounded: string;
  photoShapeSquare: string;
  sidebarBgColor: string;
  lineHeight: string;
  resetDefaults: string;
}

interface TemplateStylePanelProps {
  templateId: string;
  styleSettings: TemplateStyleValues;
  styleOverrides: PerTemplateStyleOverrides;
  onStyleOverridesChange: (overrides: PerTemplateStyleOverrides) => void;
  supportsPhoto: boolean;
  supportsSidebar: boolean;
  supportsSecondaryColor: boolean;
  labels: StyleLabels;
}

export function TemplateStylePanel({
  templateId,
  styleSettings,
  styleOverrides,
  onStyleOverridesChange,
  supportsPhoto,
  supportsSidebar,
  supportsSecondaryColor,
  labels,
}: TemplateStylePanelProps) {
  const hasOverrides = !!styleOverrides[templateId] && Object.keys(styleOverrides[templateId]).length > 0;

  const updateField = useCallback(
    <K extends keyof TemplateStyleValues>(key: K, value: TemplateStyleValues[K]) => {
      onStyleOverridesChange({
        ...styleOverrides,
        [templateId]: { ...styleOverrides[templateId], [key]: value },
      });
    },
    [templateId, styleOverrides, onStyleOverridesChange],
  );

  const handleReset = useCallback(() => {
    const next = { ...styleOverrides };
    delete next[templateId];
    onStyleOverridesChange(next);
  }, [templateId, styleOverrides, onStyleOverridesChange]);

  return (
    <SettingsSection title={labels.styleTitle} description={labels.styleDescription}>
      {/* Accent color */}
      <ColorPickerField
        id="accent-color"
        label={labels.accentColor}
        value={styleSettings.accentColor}
        onChange={(v) => updateField("accentColor", v)}
      />

      {/* Secondary color */}
      {supportsSecondaryColor && (
        <ColorPickerField
          id="secondary-color"
          label={labels.secondaryColor}
          value={styleSettings.secondaryColor}
          onChange={(v) => updateField("secondaryColor", v)}
        />
      )}

      {/* Sidebar background color */}
      {supportsSidebar && (
        <ColorPickerField
          id="sidebar-bg-color"
          label={labels.sidebarBgColor}
          value={styleSettings.sidebarBgColor}
          onChange={(v) => updateField("sidebarBgColor", v)}
        />
      )}

      {/* Photo size */}
      {supportsPhoto && (
        <NumericStepper
          label={labels.photoSize}
          value={styleSettings.photoSizePx}
          onChange={(v) => updateField("photoSizePx", v)}
          min={PHOTO_SIZE_RANGE.min}
          max={PHOTO_SIZE_RANGE.max}
          step={PHOTO_SIZE_RANGE.step}
          unit="px"
        />
      )}

      {/* Photo shape — 3 toggle buttons */}
      {supportsPhoto && (
        <div className="flex items-center justify-between py-0.5">
          <Label className="text-sm">
            {labels.photoShape}
          </Label>
          <div className="flex items-center gap-1">
            {(["circle", "rounded", "square"] as const).map((shape) => (
              <Button
                key={shape}
                type="button"
                variant={styleSettings.photoShape === shape ? "default" : "outline"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => updateField("photoShape", shape)}
              >
                {shape === "circle" ? labels.photoShapeCircle : shape === "rounded" ? labels.photoShapeRounded : labels.photoShapeSquare}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Font size */}
      <NumericStepper
        label={labels.fontScale}
        value={styleSettings.fontSizePercent}
        onChange={(v) => updateField("fontSizePercent", v)}
        min={FONT_SIZE_RANGE.min}
        max={FONT_SIZE_RANGE.max}
        step={FONT_SIZE_RANGE.step}
        unit="%"
      />

      {/* Line height */}
      <NumericStepper
        label={labels.lineHeight}
        value={styleSettings.lineHeightPercent}
        onChange={(v) => updateField("lineHeightPercent", v)}
        min={LINE_HEIGHT_RANGE.min}
        max={LINE_HEIGHT_RANGE.max}
        step={LINE_HEIGHT_RANGE.step}
        unit="%"
      />

      {/* Reset button */}
      {hasOverrides && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="w-full text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          {labels.resetDefaults}
        </Button>
      )}
    </SettingsSection>
  );
}
