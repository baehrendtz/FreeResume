"use client";

import { useCallback } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PerTemplateStyleOverrides, TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";

const FONT_MIN = 80;
const FONT_MAX = 120;
const FONT_STEP = 5;

const PHOTO_MIN = 48;
const PHOTO_MAX = 144;
const PHOTO_STEP = 16;

interface StyleLabels {
  styleTitle: string;
  styleDescription: string;
  accentColor: string;
  photoSize: string;
  fontScale: string;
  resetDefaults: string;
}

interface TemplateStylePanelProps {
  templateId: string;
  styleSettings: TemplateStyleValues;
  styleOverrides: PerTemplateStyleOverrides;
  onStyleOverridesChange: (overrides: PerTemplateStyleOverrides) => void;
  supportsPhoto: boolean;
  labels: StyleLabels;
}

export function TemplateStylePanel({
  templateId,
  styleSettings,
  styleOverrides,
  onStyleOverridesChange,
  supportsPhoto,
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

  const pct = styleSettings.fontSizePercent;
  const photoPx = styleSettings.photoSizePx;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium">{labels.styleTitle}</h3>
        <p className="text-xs text-muted-foreground">{labels.styleDescription}</p>
      </div>

      {/* Accent color */}
      <div className="flex items-center justify-between py-0.5">
        <Label htmlFor="accent-color" className="text-sm">
          {labels.accentColor}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="accent-color"
            type="color"
            value={styleSettings.accentColor}
            onChange={(e) => updateField("accentColor", e.target.value)}
            className="w-10 h-8 p-0.5 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground font-mono w-16">
            {styleSettings.accentColor}
          </span>
        </div>
      </div>

      {/* Photo size — +/- stepper with px */}
      {supportsPhoto && (
        <div className="flex items-center justify-between py-0.5">
          <Label className="text-sm">
            {labels.photoSize}
          </Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={photoPx <= PHOTO_MIN}
              onClick={() => updateField("photoSizePx", Math.max(PHOTO_MIN, photoPx - PHOTO_STEP))}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm tabular-nums w-14 text-center font-medium">
              {photoPx}px
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={photoPx >= PHOTO_MAX}
              onClick={() => updateField("photoSizePx", Math.min(PHOTO_MAX, photoPx + PHOTO_STEP))}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Font size — +/- stepper with percentage */}
      <div className="flex items-center justify-between py-0.5">
        <Label className="text-sm">
          {labels.fontScale}
        </Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={pct <= FONT_MIN}
            onClick={() => updateField("fontSizePercent", Math.max(FONT_MIN, pct - FONT_STEP))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center font-medium">
            {pct}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={pct >= FONT_MAX}
            onClick={() => updateField("fontSizePercent", Math.min(FONT_MAX, pct + FONT_STEP))}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Reset button — only visible when overrides exist */}
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
    </div>
  );
}
