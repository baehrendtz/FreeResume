"use client";

import { useCallback, useRef, useState } from "react";

interface UsePdfDropOptions {
  onFileSelected: (file: File) => void;
  invalidFileTypeMessage?: string;
}

export function usePdfDrop({ onFileSelected, invalidFileTypeMessage }: UsePdfDropOptions) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "application/pdf") {
        setError(null);
        onFileSelected(file);
      } else {
        setError(invalidFileTypeMessage ?? "Please select a PDF file");
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
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  return { dragOver, inputRef, handleDrop, handleChange, handleDragOver, handleDragLeave, error };
}
