"use client";

import { NumericStepper } from "@/components/ui/numeric-stepper";
import { SettingsSection } from "./SettingsSection";
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
    <SettingsSection title={labels.contentLimitsTitle} description={labels.contentLimitsDescription}>
      {LIMIT_FIELDS.map(({ key, min, max, step }) => (
        <NumericStepper
          key={key}
          id={`limit-${key}`}
          label={labels[key]}
          value={displaySettings[key]}
          min={min}
          max={max}
          step={step}
          editable
          onChange={(val) =>
            onDisplaySettingsChange({ ...displaySettings, [key]: val })
          }
        />
      ))}
    </SettingsSection>
  );
}
