"use client";

import { useState, useCallback } from "react";
import type { CvModel } from "@/lib/model/CvModel";
import type { ParseResult } from "@/lib/parser/linkedinParser";
import type { SessionData } from "@/lib/export/printHelpers";
import { isCvFile, readCvFile } from "@/lib/export/cvFile";
import { trackPdfUpload, trackCvFileOpen } from "@/lib/analytics/gtag";

/** A LinkedIn PDF brings CV data only, a saved CV file restores everything. */
export type ImportResult =
  | { source: "pdf"; cv: CvModel; detectedLanguage: ParseResult["detectedLanguage"] }
  | ({ source: "file" } & SessionData);

export type ImportError = "pdf_parse_failed" | "cv_file_invalid";

/** What the import is doing right now, shown as progress steps. */
export type ImportPhase = "reading" | "parsing";

export function usePdfImport(onImported: (result: ImportResult) => void) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<ImportError | null>(null);
  const [phase, setPhase] = useState<ImportPhase | null>(null);

  const handleFileSelected = useCallback(
    async (file: File) => {
      const cvFile = isCvFile(file);
      setProcessing(true);
      setPhase("reading");
      setError(null);
      try {
        if (cvFile) {
          onImported({ source: "file", ...(await readCvFile(file)) });
          trackCvFileOpen("success");
        } else {
          const { extractText } = await import("@/lib/pdf/extractText");
          const pages = await extractText(file);
          setPhase("parsing");
          const { parseLinkedInPdf } = await import("@/lib/parser/linkedinParser");
          const result = parseLinkedInPdf(pages);
          onImported({ source: "pdf", cv: result.cv, detectedLanguage: result.detectedLanguage });
          trackPdfUpload("success");
        }
      } catch (err) {
        console.error(cvFile ? "CV file import failed:" : "PDF import failed:", err);
        if (cvFile) trackCvFileOpen("failure");
        else trackPdfUpload("failure");
        setError(cvFile ? "cv_file_invalid" : "pdf_parse_failed");
      } finally {
        setProcessing(false);
        setPhase(null);
      }
    },
    [onImported],
  );

  const clearError = useCallback(() => setError(null), []);

  return { processing, phase, error, clearError, handleFileSelected };
}
