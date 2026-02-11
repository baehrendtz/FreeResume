"use client";

import { useState, useCallback } from "react";
import { downloadPdf } from "@/lib/export/printHelpers";
import { trackPdfDownload } from "@/lib/analytics/gtag";

export function usePdfExport(name: string, templateId: string) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadPdf(name);
      trackPdfDownload(templateId);
    } finally {
      setDownloading(false);
    }
  }, [name, templateId]);

  return { downloading, handleDownloadPdf };
}
