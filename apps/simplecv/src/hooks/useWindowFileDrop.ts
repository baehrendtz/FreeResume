"use client";

import { useEffect, useRef, useState } from "react";

function hasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes("Files");
}

/**
 * Accept a file dropped anywhere in the window, which also stops the browser
 * from opening a PDF that misses the drop area. Returns true while a file is
 * dragged over the page.
 */
export function useWindowFileDrop(onFile: (file: File) => void, enabled: boolean): boolean {
  const [isDragging, setIsDragging] = useState(false);
  const onFileRef = useRef(onFile);
  // dragenter/dragleave fire for every child element, count them to know when the pointer left the window
  const depth = useRef(0);

  useEffect(() => {
    onFileRef.current = onFile;
  }, [onFile]);

  useEffect(() => {
    if (!enabled) return;

    const handleEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setIsDragging(true);
    };
    const handleOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const handleLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file) onFileRef.current(file);
    };

    window.addEventListener("dragenter", handleEnter);
    window.addEventListener("dragover", handleOver);
    window.addEventListener("dragleave", handleLeave);
    window.addEventListener("drop", handleDrop);
    return () => {
      window.removeEventListener("dragenter", handleEnter);
      window.removeEventListener("dragover", handleOver);
      window.removeEventListener("dragleave", handleLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [enabled]);

  return isDragging;
}
