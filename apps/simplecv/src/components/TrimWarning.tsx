"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { CvModel } from "@/lib/model/CvModel";
import type { RenderModel, LayoutMetrics } from "@/lib/fitting/types";
import { computeTrimInfo, type TrimCount } from "@/lib/model/DisplaySettings";

interface TrimWarningProps {
  cv: CvModel;
  renderModel: RenderModel;
  metrics: LayoutMetrics | null;
  isFitting: boolean;
  onAutoFit: () => void;
}

/**
 * Amber banner listing content trimmed by the fitting pipeline, with an
 * auto-fit action when the CV overflows its page target.
 */
export function TrimWarning({ cv, renderModel, metrics, isFitting, onAutoFit }: TrimWarningProps) {
  const t = useTranslations();
  const trim = computeTrimInfo(cv, renderModel);

  const parts: string[] = [];
  const pushCount = (key: string, c: TrimCount) => {
    if (c.shown < c.total) parts.push(t(key, { shown: c.shown, total: c.total }));
  };
  pushCount("editor.visibility.trimmedJobs", trim.experience);
  pushCount("editor.visibility.trimmedEducation", trim.education);
  pushCount("editor.visibility.trimmedSkills", trim.skills);
  pushCount("editor.visibility.trimmedExtras", trim.extras);
  if (trim.summaryTruncated) parts.push(t("editor.visibility.summaryTruncated"));

  const overflows = metrics != null && !metrics.fits;
  if (overflows) {
    parts.push(t("editor.visibility.overflows", { pages: String(metrics.estimatedPages) }));
  }

  if (parts.length === 0) return null;

  return (
    <div className="print:hidden mb-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <div className="flex-1">
          {parts.length === 1 ? (
            <span>{parts[0]}</span>
          ) : (
            <ul className="list-disc list-inside space-y-0.5">
              {parts.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
        </div>
        {overflows && (
          <button
            type="button"
            onClick={onAutoFit}
            disabled={isFitting}
            className="shrink-0 inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors disabled:opacity-50"
          >
            {isFitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("editor.visibility.fitting")}
              </>
            ) : (
              t("editor.visibility.autoFit")
            )}
          </button>
        )}
      </div>
    </div>
  );
}
