"use client";

import { useRef } from "react";
import { Upload, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface OnboardingDialogProps {
  open: boolean;
  onFileSelected: (file: File) => void;
  onStartFromScratch: () => void;
  labels: {
    title: string;
    description: string;
    uploadTitle: string;
    uploadDescription: string;
    scratchTitle: string;
    scratchDescription: string;
  };
}

export function OnboardingDialog({
  open,
  onFileSelected,
  onStartFromScratch,
  labels,
}: OnboardingDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset so the same file can be selected again
    e.target.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onStartFromScratch();
      }}
    >
      <DialogContent showCloseButton={true} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="Free Resume" className="h-12 w-auto" />
          </div>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          {/* Upload LinkedIn PDF */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800 p-4 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer"
          >
            <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium">{labels.uploadTitle}</p>
            <p className="text-xs text-muted-foreground">
              {labels.uploadDescription}
            </p>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={handleFile}
          />

          {/* Start from scratch */}
          <button
            type="button"
            onClick={onStartFromScratch}
            className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:border-foreground/30 hover:bg-muted/50 cursor-pointer"
          >
            <FileText className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium">{labels.scratchTitle}</p>
            <p className="text-xs text-muted-foreground">
              {labels.scratchDescription}
            </p>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
