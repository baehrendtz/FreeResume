"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CvPreview } from "@/components/CvPreview";
import type { RenderModel } from "@/lib/fitting/types";
import type { PageTarget } from "@/lib/model/DisplaySettings";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { PREVIEW_ZOOM, A4_WIDTH_PX } from "@/lib/constants";

interface FullscreenPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderModel: RenderModel;
  templateId: string;
  styleSettings?: TemplateStyleValues;
  pageTarget?: PageTarget;
}

export function FullscreenPreviewDialog({
  open,
  onOpenChange,
  renderModel,
  pageTarget,
  templateId,
  styleSettings,
}: FullscreenPreviewDialogProps) {
  const t = useTranslations();
  const [zoom, setZoom] = useState(1.0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Start zoomed to fit the dialog width, critical on mobile where the
  // full-size A4 (794px) would force horizontal panning. Measured in a rAF
  // so the dialog has been laid out (and to avoid sync setState in effects).
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const width = scrollAreaRef.current?.clientWidth;
      if (!width) return;
      const padding = 48; // p-6 on both sides
      const fit = (width - padding) / A4_WIDTH_PX;
      setZoom(Math.min(1, Math.max(PREVIEW_ZOOM.min, Math.floor(fit * 100) / 100)));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setZoom(1.0);
      onOpenChange(next);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[95vw] h-[90dvh] flex flex-col gap-0 p-0">
        <DialogTitle className="sr-only">{t("preview.title")}</DialogTitle>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-2 border-b px-4 py-2 shrink-0">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={zoom <= PREVIEW_ZOOM.min}
            onClick={() => setZoom((z) => Math.max(PREVIEW_ZOOM.min, +(z - PREVIEW_ZOOM.step).toFixed(2)))}
            aria-label={t("preview.zoomOut")}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1.0)}
            className="min-w-[4rem] tabular-nums"
          >
            {Math.round(zoom * 100)}%
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            disabled={zoom >= PREVIEW_ZOOM.max}
            onClick={() => setZoom((z) => Math.min(PREVIEW_ZOOM.max, +(z + PREVIEW_ZOOM.step).toFixed(2)))}
            aria-label={t("preview.zoomIn")}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable preview area */}
        {/* Child uses m-auto instead of parent justify-center so the left edge
            stays reachable when the content overflows horizontally */}
        <div ref={scrollAreaRef} className="flex-1 overflow-auto flex p-6">
          <div className="shrink-0 m-auto">
            <CvPreview
              renderModel={renderModel}
              templateId={templateId}
              zoomLevel={zoom}
              styleSettings={styleSettings}
              pageTarget={pageTarget}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
