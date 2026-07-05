"use client";

import { useRef, useEffect, useCallback, Suspense } from "react";
import type { RenderModel } from "@/lib/fitting/types";
import type { LayoutMetrics } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { templates } from "@/templates/templateRegistry";
import { TemplateErrorBoundary } from "@/components/TemplateErrorBoundary";
import type { PageTarget } from "@/lib/model/DisplaySettings";
import { A4_WIDTH_PX, A4_HEIGHT_PX } from "@/lib/constants";

interface MeasureViewProps {
  templateId: string;
  renderModel: RenderModel;
  onMeasure: (metrics: LayoutMetrics) => void;
  styleSettings?: TemplateStyleValues;
  pageTarget?: PageTarget;
}

export function MeasureView({ templateId, renderModel, onMeasure, styleSettings, pageTarget = 1 }: MeasureViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const contentHeightPx = container.getBoundingClientRect().height;
    const targetHeightPx = A4_HEIGHT_PX * pageTarget;
    const estimatedPages = Math.max(1, Math.ceil(contentHeightPx / A4_HEIGHT_PX));

    onMeasure({
      fits: contentHeightPx <= targetHeightPx,
      estimatedPages,
    });
  }, [onMeasure, pageTarget]);

  const debouncedMeasure = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(measure, 100);
  }, [measure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(debouncedMeasure);
    observer.observe(container);

    // Initial measurement
    debouncedMeasure();

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [debouncedMeasure]);

  // Re-measure when renderModel changes
  useEffect(() => {
    debouncedMeasure();
  }, [renderModel, debouncedMeasure]);

  const entry = templates[templateId] ?? templates.basic;
  const Template = entry.component;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: A4_WIDTH_PX,
        visibility: "hidden",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Actual template content to measure */}
      <div ref={containerRef}>
        <TemplateErrorBoundary>
          <Suspense fallback={null}>
            <Template cv={renderModel} styleSettings={styleSettings} />
          </Suspense>
        </TemplateErrorBoundary>
      </div>
    </div>
  );
}
