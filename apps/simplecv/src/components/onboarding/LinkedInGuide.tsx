"use client";

import { User, MoreHorizontal, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LinkedInGuideProps {
  labels: {
    guideTitle: string;
    guideStep1: string;
    guideStep2: string;
    guideStep3: string;
  };
}

const STEPS = [
  { icon: User, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: MoreHorizontal, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { icon: Upload, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
] as const;

export function LinkedInGuide({ labels }: LinkedInGuideProps) {
  const stepTexts = [labels.guideStep1, labels.guideStep2, labels.guideStep3];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">{labels.guideTitle}</h2>
      <div className="grid gap-4 max-w-md mx-auto">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card key={i} className="border-muted">
              <CardContent className="flex items-start gap-4 p-4">
                <div className={`flex items-center justify-center h-10 w-10 rounded-full shrink-0 ${step.bg}`}>
                  <span className={`text-sm font-bold ${step.color}`}>{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">{stepTexts[i]}</p>
                </div>
                <div className={`shrink-0 ${step.bg} rounded-lg p-2`}>
                  <Icon className={`h-5 w-5 ${step.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
