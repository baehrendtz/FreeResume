"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Download, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { CvPreview } from "@/components/CvPreview";
import { MeasureView } from "@/components/MeasureView";
import { TemplateSwitcher } from "@/components/TemplateSwitcher";
import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { LayoutMetrics, RenderModel } from "@/lib/fitting/types";
import type { PerTemplateStyleOverrides, TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { ACCENT_COLOR_PRESETS } from "@/lib/constants";

interface ResultViewProps {
  cv: CvModel;
  source: "pdf" | "file" | "sample";
  renderModel: RenderModel;
  templateId: string;
  onTemplateSelect: (id: string) => void;
  displaySettings: DisplaySettings;
  styleSettings: TemplateStyleValues;
  styleOverrides: PerTemplateStyleOverrides;
  onStyleOverridesChange: (overrides: PerTemplateStyleOverrides) => void;
  onMeasure: (metrics: LayoutMetrics) => void;
  onDownload: () => void;
  downloading: boolean;
  onEdit: () => void;
  /** Fit and export notices shown above the result. */
  banner: ReactNode;
}

/** Shown right after an import: the finished CV, download, and the few choices most people make. */
export function ResultView({
  cv,
  source,
  renderModel,
  templateId,
  onTemplateSelect,
  displaySettings,
  styleSettings,
  styleOverrides,
  onStyleOverridesChange,
  onMeasure,
  onDownload,
  downloading,
  onEdit,
  banner,
}: ResultViewProps) {
  const t = useTranslations();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the result so keyboard and screen reader users land on it after the upload
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const summary =
    source === "file"
      ? t("result.fileSummary")
      : source === "sample"
        ? t("result.sampleSummary")
        : t("result.importedSummary", {
          jobs: cv.experience.length,
          education: cv.education.length,
          skills: cv.skills.length,
        });

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:py-8">
      {banner}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_1fr] lg:gap-x-10">
        <section className="space-y-4 lg:col-start-2 lg:row-start-1">
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight outline-none">
              {t("result.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
            {source === "pdf" && <p className="mt-2 text-sm text-muted-foreground">{t("result.reviewHint")}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
            <Button size="lg" className="sm:flex-1 lg:flex-none" onClick={onDownload} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloading ? t("actions.generating") : t("actions.downloadPdf")}
            </Button>
            <Button size="lg" variant="outline" className="sm:flex-1 lg:flex-none" onClick={onEdit}>
              <PencilLine className="h-4 w-4" />
              {t("result.edit")}
            </Button>
          </div>
        </section>

        <div className="min-w-0 rounded-2xl bg-desk p-3 sm:p-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:p-10">
          <div className="mx-auto max-w-[794px]">
            <CvPreview
              renderModel={renderModel}
              templateId={templateId}
              styleSettings={styleSettings}
              pageTarget={displaySettings.pageTarget}
              exportSource
            />
          </div>
          <MeasureView
            templateId={templateId}
            renderModel={renderModel}
            onMeasure={onMeasure}
            styleSettings={styleSettings}
            pageTarget={displaySettings.pageTarget}
          />
        </div>

        <section className="space-y-6 lg:col-start-2 lg:row-start-2 lg:self-start">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">{t("result.templateTitle")}</h2>
            <TemplateSwitcher
              activeId={templateId}
              onSelect={onTemplateSelect}
              cv={cv}
              displaySettings={displaySettings}
              styleOverrides={styleOverrides}
            />
          </div>
          <ColorPickerField
            id="result-accent-color"
            label={t("result.colorTitle")}
            value={styleSettings.accentColor}
            presets={ACCENT_COLOR_PRESETS}
            onChange={(accentColor) =>
              onStyleOverridesChange({
                ...styleOverrides,
                [templateId]: { ...styleOverrides[templateId], accentColor },
              })
            }
          />
          <p className="text-sm text-muted-foreground">{t("result.editHint")}</p>
        </section>
      </div>
    </div>
  );
}
