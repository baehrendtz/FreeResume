"use client";

import { useState, useCallback } from "react";
import type { ParseResult } from "@/lib/parser/linkedinParser";
import { trackPdfUpload } from "@/lib/analytics/gtag";

export function usePdfImport(onImported: (result: ParseResult) => void) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setProcessing(true);
      setError(null);
      try {
        const { extractText } = await import("@/lib/pdf/extractText");
        const pages = await extractText(file);
        const { parseLinkedInPdf } = await import("@/lib/parser/linkedinParser");
        const result = parseLinkedInPdf(pages);
        onImported(result);
        trackPdfUpload("success");
      } catch (err) {
        console.error("PDF import failed:", err);
        trackPdfUpload("failure");
        setError("pdf_parse_failed");
      } finally {
        setProcessing(false);
      }
    },
    [onImported],
  );

  const clearError = useCallback(() => setError(null), []);

  return { processing, error, clearError, handleFileSelected };
}
