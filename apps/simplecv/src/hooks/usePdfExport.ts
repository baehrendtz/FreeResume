"use client";

import { useState, useCallback } from "react";
import { downloadPdf } from "@/lib/export/printHelpers";
import { trackPdfDownload } from "@/lib/analytics/gtag";

export function usePdfExport(name: string, templateId: string) {
  const [downloading, setDownloading] = useState(false);
  const [exportFailed, setExportFailed] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    setDownloading(true);
    setExportFailed(false);
    try {
      await downloadPdf(name);
      trackPdfDownload(templateId);
    } catch (err) {
      // Typically canvas memory limits on mobile Safari, surface it in the UI
      console.error("PDF export failed:", err);
      setExportFailed(true);
    } finally {
      setDownloading(false);
    }
  }, [name, templateId]);

  return { downloading, exportFailed, handleDownloadPdf };
}
