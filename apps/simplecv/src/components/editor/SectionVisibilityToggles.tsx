"use client";

import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import { TemplateSelection } from "./settings/TemplateSelection";
import { SectionToggles } from "./settings/SectionToggles";
import { ContentLimits } from "./settings/ContentLimits";
import { LocationFormatting } from "./settings/LocationFormatting";

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

export function SectionVisibilityToggles({
  labels,
  displaySettings,
  onDisplaySettingsChange,
  templateId,
  onTemplateSelect,
}: SectionVisibilityTogglesProps) {
  return (
    <div className="space-y-4">
      <TemplateSelection label={labels.template} templateId={templateId} onTemplateSelect={onTemplateSelect} />
      <SectionToggles labels={labels} />
      {displaySettings && onDisplaySettingsChange && (
        <>
          <ContentLimits labels={labels} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
          <LocationFormatting labels={labels} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
        </>
      )}
    </div>
  );
}
