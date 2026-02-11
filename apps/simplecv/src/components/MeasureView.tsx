"use client";

import { useRef, useEffect, useCallback, Suspense } from "react";
import type { RenderModel } from "@/lib/fitting/types";
import type { LayoutMetrics } from "@/lib/fitting/types";
import { templates } from "@/templates/templateRegistry";
import { TemplateErrorBoundary } from "@/components/TemplateErrorBoundary";

interface MeasureViewProps {
  templateId: string;
  renderModel: RenderModel;
  onMeasure: (metrics: LayoutMetrics) => void;
}

export function MeasureView({ templateId, renderModel, onMeasure }: MeasureViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;

    const contentHeightPx = container.getBoundingClientRect().height;
    const pageHeightPx = page.getBoundingClientRect().height;
    const overflowPx = Math.max(0, contentHeightPx - pageHeightPx);
    const estimatedPages = pageHeightPx > 0 ? Math.ceil(contentHeightPx / pageHeightPx) : 1;

    onMeasure({
      fits: contentHeightPx <= pageHeightPx,
      contentHeightPx,
      pageHeightPx,
      overflowPx,
      estimatedPages,
    });
  }, [onMeasure]);

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
        width: "210mm",
        visibility: "hidden",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Reference element for A4 page height */}
      <div ref={pageRef} style={{ height: "297mm", width: 0, position: "absolute" }} />

      {/* Actual template content to measure */}
      <div ref={containerRef}>
        <TemplateErrorBoundary>
          <Suspense fallback={null}>
            <Template cv={renderModel} />
          </Suspense>
        </TemplateErrorBoundary>
      </div>
    </div>
  );
}
