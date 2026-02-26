"use client";

import { Suspense, useRef, useState, useEffect } from "react";
import type { RenderModel } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { templates } from "@/templates/templateRegistry";
import { TemplateErrorBoundary } from "@/components/TemplateErrorBoundary";

import { A4_WIDTH_PX, A4_HEIGHT_PX } from "@/lib/constants";

interface CvPreviewProps {
  renderModel: RenderModel;
  templateId: string;
  zoomLevel?: number;
  styleSettings?: TemplateStyleValues;
}

export function CvPreview({ renderModel, templateId, zoomLevel, styleSettings }: CvPreviewProps) {
  const entry = templates[templateId] ?? templates.basic;
  const Template = entry.component;

  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScale, setAutoScale] = useState(1);

  const isZoomMode = zoomLevel !== undefined;
  const scale = isZoomMode ? zoomLevel : autoScale;

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

  return (
    <div
      ref={containerRef}
      className={isZoomMode ? undefined : "overflow-hidden w-full"}
      style={isZoomMode
        ? { width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }
        : { height: A4_HEIGHT_PX * scale + 4 }
      }
    >
      {/* Light-scope wrapper: CV preview is always rendered with light theme */}
      <div className="cv-preview-light">
        <div
          id="cv-preview"
          className="bg-white shadow-xl border border-gray-200 overflow-hidden rounded-sm text-left"
          style={{
            width: A4_WIDTH_PX,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <TemplateErrorBoundary>
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
        </div>
      </div>
    </div>
  );
}
