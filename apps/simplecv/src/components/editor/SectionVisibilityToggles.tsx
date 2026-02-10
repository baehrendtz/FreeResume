"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TemplateSwitcher } from "@/components/TemplateSwitcher";
import { Minus, Plus } from "lucide-react";
import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import { trackSectionToggle } from "@/lib/analytics/gtag";

interface SectionVisibilityTogglesProps {
  labels: {
    title: string;
    description: string;
    summary: string;
    experience: string;
    education: string;
    skills: string;
    languages: string;
    extras: string;
    contentLimitsTitle: string;
    contentLimitsDescription: string;
    maxExperience: string;
    maxEducation: string;
    maxSkills: string;
    maxBulletsPerJob: string;
    summaryMaxChars: string;
    maxExtras: string;
    simplifyLocationsTitle: string;
    simplifyLocationsDescription: string;
    simplifyLocations: string;
    template: string;
  };
  displaySettings?: DisplaySettings;
  onDisplaySettingsChange?: (s: DisplaySettings) => void;
  templateId: string;
  onTemplateSelect: (id: string) => void;
}

const SECTIONS = [
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "extras",
] as const;

const LIMIT_FIELDS = [
  { key: "maxExperience" as const, min: 1, max: 50, step: 1 },
  { key: "maxEducation" as const, min: 1, max: 10, step: 1 },
  { key: "maxSkills" as const, min: 1, max: 30, step: 1 },
  { key: "maxBulletsPerJob" as const, min: 0, max: 10, step: 1 },
  { key: "summaryMaxChars" as const, min: 50, max: 1000, step: 50 },
  { key: "maxExtras" as const, min: 1, max: 20, step: 1 },
] as const;

export function SectionVisibilityToggles({
  labels,
  displaySettings,
  onDisplaySettingsChange,
  templateId,
  onTemplateSelect,
}: SectionVisibilityTogglesProps) {
  const { control } = useFormContext<CvModel>();

  return (
    <div className="space-y-4">
      {/* Template selection */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium">{labels.template}</h3>
        <TemplateSwitcher activeId={templateId} onSelect={onTemplateSelect} />
      </div>

      {/* Section visibility */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium">{labels.title}</h3>
          <p className="text-xs text-muted-foreground">{labels.description}</p>
        </div>
        {SECTIONS.map((section) => (
          <Controller
            key={section}
            control={control}
            name={`sectionsVisibility.${section}`}
            render={({ field }) => (
              <div className="flex items-center justify-between py-0.5">
                <Label htmlFor={`vis-${section}`} className="text-sm">
                  {labels[section]}
                </Label>
                <Switch
                  id={`vis-${section}`}
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    trackSectionToggle(section, checked);
                  }}
                />
              </div>
            )}
          />
        ))}
      </div>

      {displaySettings && onDisplaySettingsChange && (
        <>
          {/* Content limits */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium">{labels.contentLimitsTitle}</h3>
              <p className="text-xs text-muted-foreground">
                {labels.contentLimitsDescription}
              </p>
            </div>
            {LIMIT_FIELDS.map(({ key, min, max, step }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <Label htmlFor={`limit-${key}`} className="text-sm shrink-0">
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
                        onDisplaySettingsChange({
                          ...displaySettings,
                          [key]: val,
                        });
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

          {/* Location formatting */}
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium">{labels.simplifyLocationsTitle}</h3>
              <p className="text-xs text-muted-foreground">{labels.simplifyLocationsDescription}</p>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <Label htmlFor="simplify-locations" className="text-sm">
                {labels.simplifyLocations}
              </Label>
              <Switch
                id="simplify-locations"
                checked={displaySettings.simplifyLocations}
                onCheckedChange={(checked) =>
                  onDisplaySettingsChange({ ...displaySettings, simplifyLocations: checked })
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
