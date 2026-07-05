"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CvPreview } from "@/components/CvPreview";
import { buildRenderModel } from "@/lib/fitting";
import { getTemplateMeta } from "@/templates/templateRegistry";
import { defaultDisplaySettings } from "@/lib/model/DisplaySettings";
import type { CvModel } from "@/lib/model/CvModel";
import { ONBOARDING_PREVIEW_DELAY_MS } from "@/lib/constants";

const DEFAULT_TEMPLATE_ID = "basic";

interface OnboardingSuccessProps {
  cv: CvModel;
  isFromScratch: boolean;
  labels: {
    successTitle: string;
    successScratchTitle: string;
    successScratchDescription: string;
    successCta: string;
    successExperience: string;
    successEducation: string;
    successSkills: string;
    successBack: string;
  };
  onComplete: () => void;
  onBack?: () => void;
}

export function OnboardingSuccess({ cv, isFromScratch, labels, onComplete, onBack }: OnboardingSuccessProps) {
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isFromScratch) return;
    const timer = setTimeout(() => setShowPreview(true), ONBOARDING_PREVIEW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isFromScratch]);

  const previewRenderModel = useMemo(() => {
    if (isFromScratch) return null;
    const meta = getTemplateMeta(DEFAULT_TEMPLATE_ID);
    return buildRenderModel(cv, meta, defaultDisplaySettings);
  }, [cv, isFromScratch]);

  const stats = [
    { count: cv.experience.length, label: labels.successExperience },
    { count: cv.education.length, label: labels.successEducation },
    { count: cv.skills.length, label: labels.successSkills },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        {/* Left: success content */}
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-green-100 dark:bg-green-950/30 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {isFromScratch ? labels.successScratchTitle : labels.successTitle}
            </h2>
            {isFromScratch ? (
              <p className="text-sm text-muted-foreground max-w-sm">
                {labels.successScratchDescription}
              </p>
            ) : stats.length > 0 ? (
              <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                {stats.map((s) => (
                  <span key={s.label} className="flex items-center gap-1">
                    <span className="font-semibold text-foreground">{s.count}</span> {s.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: imported-CV preview (auto-scales to its container width) */}
        {previewRenderModel && (
          <div
            className={`overflow-hidden rounded-lg shadow-lg transition-all duration-700 ease-out w-full max-w-[280px] md:max-w-sm ${
              showPreview
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <CvPreview
              templateId={DEFAULT_TEMPLATE_ID}
              renderModel={previewRenderModel}
            />
          </div>
        )}
      </div>

      <Button size="lg" onClick={onComplete} className="mt-2">
        {labels.successCta}
      </Button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {labels.successBack}
        </button>
      )}
    </div>
  );
}
