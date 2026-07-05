"use client";

import { useCallback, useRef, useState } from "react";

interface UsePdfDropOptions {
  onFileSelected: (file: File) => void;
  invalidFileTypeMessage: string;
}

/** True if the file looks like a PDF. Some platforms deliver dropped files
 *  with an empty MIME type, match extractText's lenient rule. */
function isPdfFile(file: File): boolean {
  if (file.type) return file.type === "application/pdf";
  return file.name.toLowerCase().endsWith(".pdf");
}

export function usePdfDrop({ onFileSelected, invalidFileTypeMessage }: UsePdfDropOptions) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (isPdfFile(file)) {
        setError(null);
        onFileSelected(file);
      } else {
        setError(invalidFileTypeMessage);
      }
    },
    [onFileSelected, invalidFileTypeMessage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so selecting the same file again re-triggers onChange
      e.target.value = "";
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Ignore leave events fired when the pointer moves onto a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOver(false);
  }, []);

  return { dragOver, inputRef, handleDrop, handleChange, handleDragOver, handleDragLeave, error };
}
