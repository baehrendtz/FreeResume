"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CvPreview } from "@/components/CvPreview";
import { buildRenderModel } from "@/lib/fitting";
import { templates } from "@/templates/templateRegistry";
import { resolveStyleSettings, type PerTemplateStyleOverrides } from "@/lib/model/TemplateStyleSettings";
import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";

interface TemplateSwitcherProps {
  activeId: string;
  onSelect: (id: string) => void;
  cv: CvModel;
  displaySettings: DisplaySettings;
  styleOverrides: PerTemplateStyleOverrides;
}

/** Template picker showing a live thumbnail of the user's own CV in every template. */
export function TemplateSwitcher({ activeId, onSelect, cv, displaySettings, styleOverrides }: TemplateSwitcherProps) {
  const options = useMemo(
    () =>
      Object.entries(templates).map(([id, entry]) => ({
        id,
        name: entry.meta.name,
        renderModel: buildRenderModel(cv, entry.meta, displaySettings),
        styleSettings: resolveStyleSettings(id, entry.defaultStyle, styleOverrides),
      })),
    [cv, displaySettings, styleOverrides],
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(({ id, name, renderModel, styleSettings }) => {
        const isActive = id === activeId;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={isActive}
            className={cn(
              "rounded-lg border-2 bg-muted/40 p-2 text-left transition-colors",
              isActive ? "border-primary" : "border-transparent hover:border-muted-foreground/30",
            )}
          >
            {/* Decorative thumbnail, the button is labelled by the template name */}
            <div aria-hidden className="pointer-events-none">
              <CvPreview renderModel={renderModel} templateId={id} styleSettings={styleSettings} />
            </div>
            <span className="mt-2 flex items-center gap-1.5 text-sm">
              {isActive && <Check className="h-4 w-4 shrink-0 text-primary" />}
              <span className={isActive ? "font-medium" : "text-muted-foreground"}>{name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
