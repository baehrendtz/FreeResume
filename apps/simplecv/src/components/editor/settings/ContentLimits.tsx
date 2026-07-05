"use client";

import { NumericStepper } from "@/components/ui/numeric-stepper";
import { SettingsSection } from "./SettingsSection";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import { CONTENT_LIMIT_RANGES } from "@/lib/constants";

const LIMIT_FIELDS = (
  Object.keys(CONTENT_LIMIT_RANGES) as (keyof typeof CONTENT_LIMIT_RANGES)[]
).map((key) => ({ key, ...CONTENT_LIMIT_RANGES[key] }));

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
