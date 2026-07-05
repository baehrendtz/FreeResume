"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import type { RenderModel } from "@/lib/fitting/types";
import type { PageTarget } from "@/lib/model/DisplaySettings";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { templates } from "@/templates/templateRegistry";
import { TemplateErrorBoundary } from "@/components/TemplateErrorBoundary";

import { A4_WIDTH_PX, A4_HEIGHT_PX } from "@/lib/constants";

const PAGE_GAP = 16;

interface CvPreviewProps {
  renderModel: RenderModel;
  templateId: string;
  zoomLevel?: number;
  styleSettings?: TemplateStyleValues;
  pageTarget?: PageTarget;
  /** Marks this instance as the html2canvas export source (adds id="cv-preview").
   *  Only one mounted CvPreview may set this. */
  exportSource?: boolean;
}

export function CvPreview({ renderModel, templateId, zoomLevel, styleSettings, pageTarget = 1, exportSource = false }: CvPreviewProps) {
  const entry = templates[templateId] ?? templates.basic;
  const Template = entry.component;

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);
  const [actualPages, setActualPages] = useState(1);

  const isZoomMode = zoomLevel !== undefined;
  const scale = isZoomMode ? zoomLevel : autoScale;
  const showMultiPage = pageTarget > 1;

  // Auto-scale to fit container width
  useEffect(() => {
    if (isZoomMode) return;
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      setAutoScale(Math.min(1, width / A4_WIDTH_PX));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isZoomMode]);

  // Measure actual content height to determine page count
  useEffect(() => {
    if (!showMultiPage) return;
    const el = contentRef.current;
    if (!el) return;

    const updatePages = () => {
      const contentH = el.getBoundingClientRect().height;
      setActualPages(Math.min(pageTarget, Math.max(1, Math.ceil(contentH / A4_HEIGHT_PX))));
    };

    const ro = new ResizeObserver(updatePages);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showMultiPage, pageTarget, renderModel]);

  const exportId = exportSource ? "cv-preview" : undefined;

  const templateContent = useMemo(() => (
    <TemplateErrorBoundary resetKey={templateId}>
      <Suspense
        fallback={
          <div className="p-8 text-center text-gray-500">
            Loading template...
          </div>
        }
      >
        <Template cv={renderModel} styleSettings={styleSettings} />
      </Suspense>
    </TemplateErrorBoundary>
  ), [Template, templateId, renderModel, styleSettings]);

  // Single-page mode (original behavior)
  if (!showMultiPage) {
    return (
      <div
        ref={containerRef}
        className={isZoomMode ? undefined : "overflow-hidden w-full"}
        style={isZoomMode
          ? { width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }
          : { height: A4_HEIGHT_PX * scale + 4 }
        }
      >
        <div className="cv-preview-light">
          <div
            id={exportId}
            className="bg-white shadow-xl border border-gray-200 overflow-hidden rounded-sm text-left"
            style={{
              width: A4_WIDTH_PX,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {templateContent}
          </div>
        </div>
      </div>
    );
  }

  // Multi-page mode: render template once off-screen, then clip per page
  const totalHeight = (A4_HEIGHT_PX * actualPages + PAGE_GAP * (actualPages - 1)) * scale;

  return (
    <div
      ref={containerRef}
      className={isZoomMode ? undefined : "w-full"}
      style={isZoomMode
        ? { width: A4_WIDTH_PX * scale, height: totalHeight }
        : { height: totalHeight + 4 }
      }
    >
      <div className="cv-preview-light">
        {/* Off-screen full-height render for measurement + html2canvas.
            Kept visible (only moved off-screen) so html2canvas can paint it. */}
        <div
          id={exportId}
          ref={contentRef}
          aria-hidden
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            width: A4_WIDTH_PX,
            pointerEvents: "none",
          }}
        >
          {templateContent}
        </div>

        {/* Visible pages with clipping, one shared scale wrapper so page
            layout boxes shrink together with the content */}
        <div
          style={{
            width: A4_WIDTH_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {Array.from({ length: actualPages }, (_, i) => (
            <div
              key={i}
              className="bg-white shadow-xl border border-gray-200 overflow-hidden rounded-sm text-left"
              style={{
                width: A4_WIDTH_PX,
                height: A4_HEIGHT_PX,
                marginBottom: i < actualPages - 1 ? PAGE_GAP : 0,
              }}
            >
              <div style={{ marginTop: -(i * A4_HEIGHT_PX) }}>
                {templateContent}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
