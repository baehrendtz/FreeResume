"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CvModel } from "@/lib/model/CvModel";

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
  };
  onComplete: () => void;
}

export function OnboardingSuccess({ cv, isFromScratch, labels, onComplete }: OnboardingSuccessProps) {
  const stats = [
    { count: cv.experience.length, label: labels.successExperience },
    { count: cv.education.length, label: labels.successEducation },
    { count: cv.skills.length, label: labels.successSkills },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
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

      <Button size="lg" onClick={onComplete} className="mt-2">
        {labels.successCta}
      </Button>
    </div>
  );
}
