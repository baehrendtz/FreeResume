"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  );
}
