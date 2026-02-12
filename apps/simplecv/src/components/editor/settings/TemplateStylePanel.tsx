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

const LINE_HEIGHT_MIN = 80;
const LINE_HEIGHT_MAX = 120;
const LINE_HEIGHT_STEP = 5;

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

  const pct = styleSettings.fontSizePercent;
  const photoPx = styleSettings.photoSizePx;
  const lhPct = styleSettings.lineHeightPercent;

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

      {/* Secondary color */}
      {supportsSecondaryColor && (
        <div className="flex items-center justify-between py-0.5">
          <Label htmlFor="secondary-color" className="text-sm">
            {labels.secondaryColor}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="secondary-color"
              type="color"
              value={styleSettings.secondaryColor}
              onChange={(e) => updateField("secondaryColor", e.target.value)}
              className="w-10 h-8 p-0.5 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground font-mono w-16">
              {styleSettings.secondaryColor}
            </span>
          </div>
        </div>
      )}

      {/* Sidebar background color */}
      {supportsSidebar && (
        <div className="flex items-center justify-between py-0.5">
          <Label htmlFor="sidebar-bg-color" className="text-sm">
            {labels.sidebarBgColor}
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="sidebar-bg-color"
              type="color"
              value={styleSettings.sidebarBgColor}
              onChange={(e) => updateField("sidebarBgColor", e.target.value)}
              className="w-10 h-8 p-0.5 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground font-mono w-16">
              {styleSettings.sidebarBgColor}
            </span>
          </div>
        </div>
      )}

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

      {/* Line height — +/- stepper with percentage */}
      <div className="flex items-center justify-between py-0.5">
        <Label className="text-sm">
          {labels.lineHeight}
        </Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={lhPct <= LINE_HEIGHT_MIN}
            onClick={() => updateField("lineHeightPercent", Math.max(LINE_HEIGHT_MIN, lhPct - LINE_HEIGHT_STEP))}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center font-medium">
            {lhPct}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={lhPct >= LINE_HEIGHT_MAX}
            onClick={() => updateField("lineHeightPercent", Math.min(LINE_HEIGHT_MAX, lhPct + LINE_HEIGHT_STEP))}
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
