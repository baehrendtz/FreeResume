"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SettingsSection } from "./SettingsSection";
import { isRememberEnabled, setRememberEnabled } from "@/lib/export/printHelpers";
import { trackRememberToggle } from "@/lib/analytics/gtag";

interface RememberSettingProps {
  labels: {
    title: string;
    description: string;
    remember: string;
    rememberHint: string;
  };
}

/** Opt-in (off by default) to keep the CV in this browser between visits. */
export function RememberSetting({ labels }: RememberSettingProps) {
  const [enabled, setEnabled] = useState(isRememberEnabled);

  return (
    <SettingsSection title={labels.title} description={labels.description}>
      <div className="flex items-center justify-between gap-3 py-0.5">
        <Label htmlFor="remember-cv" className="text-sm">
          {labels.remember}
        </Label>
        <Switch
          id="remember-cv"
          checked={enabled}
          onCheckedChange={(checked) => {
            setRememberEnabled(checked);
            setEnabled(checked);
            trackRememberToggle(checked);
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{labels.rememberHint}</p>
    </SettingsSection>
  );
}
