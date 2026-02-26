"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "./SettingsSection";
import type { CvModel } from "@/lib/model/CvModel";
import { trackSectionToggle } from "@/lib/analytics/gtag";

const SECTIONS = [
  "photo",
  "summary",
  "experience",
  "education",
  "skills",
  "languages",
  "extras",
] as const;

interface SectionTogglesProps {
  labels: {
    title: string;
    description: string;
    photo: string;
    summary: string;
    experience: string;
    education: string;
    skills: string;
    languages: string;
    extras: string;
  };
}

export function SectionToggles({ labels }: SectionTogglesProps) {
  const { control } = useFormContext<CvModel>();

  return (
    <SettingsSection title={labels.title} description={labels.description}>
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
    </SettingsSection>
  );
}
