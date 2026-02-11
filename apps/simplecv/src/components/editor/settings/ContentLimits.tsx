"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";

const LIMIT_FIELDS = [
  { key: "maxExperience" as const, min: 1, max: 50, step: 1 },
  { key: "maxEducation" as const, min: 1, max: 10, step: 1 },
  { key: "maxSkills" as const, min: 1, max: 30, step: 1 },
  { key: "maxBulletsPerJob" as const, min: 0, max: 10, step: 1 },
  { key: "summaryMaxChars" as const, min: 50, max: 1000, step: 50 },
  { key: "maxExtras" as const, min: 1, max: 20, step: 1 },
] as const;

interface ContentLimitsProps {
  labels: {
    contentLimitsTitle: string;
    contentLimitsDescription: string;
    maxExperience: string;
    maxEducation: string;
    maxSkills: string;
    maxBulletsPerJob: string;
    summaryMaxChars: string;
    maxExtras: string;
  };
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (s: DisplaySettings) => void;
}

export function ContentLimits({ labels, displaySettings, onDisplaySettingsChange }: ContentLimitsProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium">{labels.contentLimitsTitle}</h3>
        <p className="text-xs text-muted-foreground">{labels.contentLimitsDescription}</p>
      </div>
      {LIMIT_FIELDS.map(({ key, min, max, step }) => (
        <div key={key} className="flex items-center justify-between gap-2">
          <Label htmlFor={`limit-${key}`} className="text-sm min-w-0 truncate" title={labels[key]}>
            {labels[key]}
          </Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={displaySettings[key] <= min}
              onClick={() =>
                onDisplaySettingsChange({
                  ...displaySettings,
                  [key]: Math.max(min, displaySettings[key] - step),
                })
              }
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Input
              id={`limit-${key}`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={displaySettings[key]}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= min && val <= max) {
                  onDisplaySettingsChange({ ...displaySettings, [key]: val });
                }
              }}
              className="w-16 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={displaySettings[key] >= max}
              onClick={() =>
                onDisplaySettingsChange({
                  ...displaySettings,
                  [key]: Math.min(max, displaySettings[key] + step),
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
