"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CvModel } from "@/lib/model/CvModel";
import type { RenderModel, LayoutMetrics } from "@/lib/fitting/types";
import { computeTrimInfo, type PageTarget, type TrimCount } from "@/lib/model/DisplaySettings";

interface TrimWarningProps {
  cv: CvModel;
  renderModel: RenderModel;
  metrics: LayoutMetrics | null;
  isFitting: boolean;
  pageTarget: PageTarget;
  onAutoFit: () => void;
  onUseTwoPages: () => void;
  onEditLimits: () => void;
}

/**
 * Plain-language banner for when the CV overflows its page target (amber) or
 * content is left out to make it fit (blue), with one-click ways to fix it.
 */
export function TrimWarning({
  cv,
  renderModel,
  metrics,
  isFitting,
  pageTarget,
  onAutoFit,
  onUseTwoPages,
  onEditLimits,
}: TrimWarningProps) {
  const t = useTranslations();
  const trim = computeTrimInfo(cv, renderModel);

  const details: string[] = [];
  const pushCount = (key: string, c: TrimCount) => {
    if (c.shown < c.total) details.push(t(key, { shown: c.shown, total: c.total }));
  };
  pushCount("editor.visibility.trimmedJobs", trim.experience);
  pushCount("editor.visibility.trimmedEducation", trim.education);
  pushCount("editor.visibility.trimmedSkills", trim.skills);
  pushCount("editor.visibility.trimmedExtras", trim.extras);
  if (trim.summaryTruncated) details.push(t("editor.visibility.summaryTruncated"));

  const overflows = metrics != null && !metrics.fits;
  if (!overflows && details.length === 0) return null;

  const Icon = overflows ? AlertTriangle : Info;

  return (
    <div
      role="status"
      className={cn(
        "print:hidden mb-2 rounded-md border px-3 py-2.5 text-sm",
        overflows
          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300"
          : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300",
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-2">
          <Icon className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium">
              {overflows
                ? t("editor.fit.overflowTitle", { pages: String(metrics.estimatedPages) })
                : t("editor.fit.trimmedTitle")}
            </p>
            {details.length > 0 && <p className="text-xs opacity-90">{details.join(" · ")}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pl-6 sm:pl-0 sm:shrink-0">
          {overflows && (
            <Button type="button" size="sm" onClick={onAutoFit} disabled={isFitting}>
              {isFitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isFitting ? t("editor.fit.fitting") : t("editor.fit.autoFit")}
            </Button>
          )}
          {pageTarget === 1 && (
            <Button type="button" size="sm" variant="outline" className="bg-transparent" onClick={onUseTwoPages}>
              {t("editor.fit.useTwoPages")}
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={onEditLimits}>
            {t("editor.fit.editLimits")}
          </Button>
        </div>
      </div>
    </div>
  );
}
