"use client";

import { useState, useCallback } from "react";
import type { CvModel } from "@/lib/model/CvModel";
import { trackPdfUpload } from "@/lib/analytics/gtag";

export function usePdfImport(onImported: (cv: CvModel) => void) {
  const [processing, setProcessing] = useState(false);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setProcessing(true);
      try {
        const { extractText } = await import("@/lib/pdf/extractText");
        const pages = await extractText(file);
        const { parseLinkedInPdf } = await import("@/lib/parser/linkedinParser");
        const parsed = parseLinkedInPdf(pages);
        onImported(parsed);
        trackPdfUpload("success");
      } catch (err) {
        console.error("Failed to process PDF:", err);
        trackPdfUpload("failure");
      } finally {
        setProcessing(false);
      }
    },
    [onImported],
  );

  return { processing, handleFileSelected };
}
