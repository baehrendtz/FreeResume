"use client";

import { useTranslations } from "next-intl";
import { CircleAlert, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CvIssue } from "@/lib/cvChecks";
import { HEADLINE_MAX_CHARS } from "@/lib/constants";

interface DownloadChecklistDialogProps {
  issues: CvIssue[] | null;
  onClose: () => void;
  onFix: (step: string) => void;
  onDownloadAnyway: () => void;
}

/** Lists quick fixes before the PDF is generated, with a way to download anyway. */
export function DownloadChecklistDialog({ issues, onClose, onFix, onDownloadAnyway }: DownloadChecklistDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={issues !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("checklist.title")}</DialogTitle>
          <DialogDescription>{t("checklist.description")}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2">
          {issues?.map((issue) => (
            <li key={issue.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
              <CircleAlert className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="flex-1">
                {t(`checklist.issues.${issue.id}`, { count: issue.count ?? 0, max: HEADLINE_MAX_CHARS })}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={() => onFix(issue.step)}>
                {t("checklist.fix")}
              </Button>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("actions.cancel")}
          </Button>
          <Button type="button" onClick={onDownloadAnyway}>
            <Download className="h-4 w-4" />
            {t("checklist.downloadAnyway")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
