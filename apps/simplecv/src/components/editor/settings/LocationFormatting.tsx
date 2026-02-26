"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "./SettingsSection";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";

interface LocationFormattingProps {
  labels: {
    simplifyLocationsTitle: string;
    simplifyLocationsDescription: string;
    simplifyLocations: string;
  };
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (s: DisplaySettings) => void;
}

export function LocationFormatting({ labels, displaySettings, onDisplaySettingsChange }: LocationFormattingProps) {
  return (
    <SettingsSection title={labels.simplifyLocationsTitle} description={labels.simplifyLocationsDescription}>
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
    </SettingsSection>
  );
}
