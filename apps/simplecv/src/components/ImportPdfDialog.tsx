"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PdfUploader } from "@/components/PdfUploader";

interface ImportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected: (file: File) => void;
  processing: boolean;
  labels: {
    title: string;
    warning: string;
    dropzone: string;
    processing: string;
    cancel: string;
  };
}

export function ImportPdfDialog({
  open,
  onOpenChange,
  onFileSelected,
  processing,
  labels,
}: ImportPdfDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {labels.warning}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{labels.warning}</span>
        </div>

        <PdfUploader
          onFileSelected={onFileSelected}
          processing={processing}
          uploadLabel={labels.title}
          dropzoneLabel={labels.dropzone}
          processingLabel={labels.processing}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            {labels.cancel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
