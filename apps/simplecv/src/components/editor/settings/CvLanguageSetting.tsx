"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";

interface CvLanguageSettingProps {
  labels: {
    cvLanguageTitle: string;
    cvLanguageDescription: string;
    cvLanguageEn: string;
    cvLanguageSv: string;
  };
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (s: DisplaySettings) => void;
}

export function CvLanguageSetting({ labels, displaySettings, onDisplaySettingsChange }: CvLanguageSettingProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div>
        <h3 className="text-sm font-medium">{labels.cvLanguageTitle}</h3>
        <p className="text-xs text-muted-foreground">{labels.cvLanguageDescription}</p>
      </div>
      <div className="flex items-center justify-between py-0.5">
        <Label htmlFor="cv-language" className="text-sm">
          {labels.cvLanguageTitle}
        </Label>
        <Select
          value={displaySettings.cvLanguage ?? "en"}
          onValueChange={(v) =>
            onDisplaySettingsChange({ ...displaySettings, cvLanguage: v as "en" | "sv" })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{labels.cvLanguageEn}</SelectItem>
            <SelectItem value="sv">{labels.cvLanguageSv}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
