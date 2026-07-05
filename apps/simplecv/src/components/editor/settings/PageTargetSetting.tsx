"use client";

import { SettingsSection } from "./SettingsSection";
import { type DisplaySettings, type PageTarget, onePageDisplayDefaults, twoPageDisplayDefaults } from "@/lib/model/DisplaySettings";

interface PageTargetSettingProps {
  labels: {
    pageTargetTitle: string;
    pageTargetDescription: string;
    pageTarget1: string;
    pageTarget2: string;
  };
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (s: DisplaySettings) => void;
}

export function PageTargetSetting({ labels, displaySettings, onDisplaySettingsChange }: PageTargetSettingProps) {
  const current = displaySettings.pageTarget ?? 1;

  const handleSelect = (target: PageTarget) => {
    if (target === current) return;
    // Apply sensible content limits when switching page target
    const defaults = target === 2 ? twoPageDisplayDefaults : onePageDisplayDefaults;
    onDisplaySettingsChange({ ...displaySettings, ...defaults, pageTarget: target });
  };

  return (
    <SettingsSection title={labels.pageTargetTitle} description={labels.pageTargetDescription}>
      <div className="flex gap-2">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleSelect(n)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
              current === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {n === 1 ? labels.pageTarget1 : labels.pageTarget2}
          </button>
        ))}
      </div>
    </SettingsSection>
  );
}
