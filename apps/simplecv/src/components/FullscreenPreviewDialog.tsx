"use client";

import { useState, useCallback } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CvPreview } from "@/components/CvPreview";
import type { RenderModel } from "@/lib/fitting/types";

interface FullscreenPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderModel: RenderModel;
  templateId: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.25;

export function FullscreenPreviewDialog({
  open,
  onOpenChange,
  renderModel,
  templateId,
}: FullscreenPreviewDialogProps) {
  const [zoom, setZoom] = useState(1.0);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) setZoom(1.0);
      onOpenChange(next);
    },
    [onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[95vw] h-[90vh] flex flex-col gap-0 p-0">
        <DialogTitle className="sr-only">CV Preview</DialogTitle>

        {/* Toolbar */}
        <div className="flex items-center justify-center gap-2 border-b px-4 py-2 shrink-0">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))}
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
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable preview area */}
        <div className="flex-1 overflow-auto flex justify-center p-6">
          <div className="shrink-0">
            <CvPreview
              renderModel={renderModel}
              templateId={templateId}
              zoomLevel={zoom}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
