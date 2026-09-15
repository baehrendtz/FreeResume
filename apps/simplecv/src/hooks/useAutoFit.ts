"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { LayoutMetrics, TemplateMeta } from "@/lib/fitting/types";
import { fitToTemplate } from "@/lib/fitting";
import { trackAutoFit } from "@/lib/analytics/gtag";
import { MAX_FIT_ITERATIONS } from "@/lib/constants";

export function useAutoFit(
  cv: CvModel,
  setCv: React.Dispatch<React.SetStateAction<CvModel>>,
  templateMeta: TemplateMeta,
  displaySettings: DisplaySettings,
  setDisplaySettings: React.Dispatch<React.SetStateAction<DisplaySettings>>,
) {
  const [metrics, setMetricsRaw] = useState<LayoutMetrics | null>(null);
  const [isFitting, setIsFitting] = useState(false);
  const fittingIterRef = useRef(0);
  const isFittingRef = useRef(false);
  // Set right after an import, the next measurement then shortens the new content if it overflows
  const autoFitPendingRef = useRef(false);

  const cvRef = useRef(cv);
  const settingsRef = useRef(displaySettings);

  useEffect(() => {
    cvRef.current = cv;
  }, [cv]);
  useEffect(() => {
    settingsRef.current = displaySettings;
  }, [displaySettings]);

  const applyFitResult = useCallback(
    (result: ReturnType<typeof fitToTemplate>) => {
      if (!result) {
        setIsFitting(false);
        isFittingRef.current = false;
        return;
      }
      setDisplaySettings(result.displaySettings);
      if (Object.keys(result.visibilityOverrides).length > 0) {
        setCv((prev) => ({
          ...prev,
          sectionsVisibility: { ...prev.sectionsVisibility, ...result.visibilityOverrides },
        }));
      }
    },
    [setCv, setDisplaySettings],
  );

  const startFitting = useCallback(
    (current: LayoutMetrics) => {
      fittingIterRef.current = 0;
      setIsFitting(true);
      isFittingRef.current = true;
      applyFitResult(fitToTemplate(cvRef.current, templateMeta, settingsRef.current, current));
    },
    [templateMeta, applyFitResult],
  );

  // Wrap setMetrics to also handle fitting continuation in the callback
  const setMetrics = useCallback(
    (newMetrics: LayoutMetrics) => {
      setMetricsRaw(newMetrics);

      if (autoFitPendingRef.current && !isFittingRef.current) {
        autoFitPendingRef.current = false;
        if (!newMetrics.fits) startFitting(newMetrics);
        return;
      }

      if (!isFittingRef.current) return;

      if (newMetrics.fits) {
        setIsFitting(false);
        isFittingRef.current = false;
        return;
      }

      fittingIterRef.current += 1;
      if (fittingIterRef.current >= MAX_FIT_ITERATIONS) {
        setIsFitting(false);
        isFittingRef.current = false;
        return;
      }

      const result = fitToTemplate(cvRef.current, templateMeta, settingsRef.current, newMetrics);
      applyFitResult(result);
    },
    [templateMeta, applyFitResult, startFitting],
  );

  const handleAutoFit = useCallback(() => {
    if (!metrics || metrics.fits) return;
    trackAutoFit();
    startFitting(metrics);
  }, [metrics, startFitting]);

  /** Auto-fit as soon as the next layout measurement arrives. */
  const requestAutoFit = useCallback(() => {
    autoFitPendingRef.current = true;
  }, []);

  return { metrics, setMetrics, isFitting, handleAutoFit, requestAutoFit };
}
