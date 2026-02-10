"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";

interface PdfUploaderProps {
  onFileSelected: (file: File) => void;
  processing: boolean;
  uploadLabel: string;
  dropzoneLabel: string;
  processingLabel: string;
  startFromScratchLabel?: string;
  onStartFromScratch?: () => void;
}

export function PdfUploader({
  onFileSelected,
  processing,
  uploadLabel,
  dropzoneLabel,
  processingLabel,
  startFromScratchLabel,
  onStartFromScratch,
}: PdfUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "application/pdf") {
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div
        className={`w-full flex flex-col items-center justify-center gap-5 p-16 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
          dragOver
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]"
            : "border-muted-foreground/25 hover:border-blue-400 hover:bg-muted/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className={`rounded-full p-4 transition-colors ${
          dragOver ? "bg-blue-100 dark:bg-blue-900/30" : "bg-muted"
        }`}>
          {processing ? (
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
          ) : (
            <Upload className={`h-10 w-10 transition-colors ${
              dragOver ? "text-blue-500" : "text-muted-foreground"
            }`} />
          )}
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">{uploadLabel}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {processing ? processingLabel : dropzoneLabel}
          </p>
        </div>
        {!processing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            <span>PDF</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      {onStartFromScratch && startFromScratchLabel && (
        <Button variant="ghost" onClick={onStartFromScratch} disabled={processing}>
          {startFromScratchLabel}
        </Button>
      )}
    </div>
  );
}
