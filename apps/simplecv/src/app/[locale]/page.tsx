"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { createEmptyCvModel } from "@/lib/model/CvModel";
import { computeTrimInfo } from "@/lib/model/DisplaySettings";
import { CvPreview } from "@/components/CvPreview";
import { MeasureView } from "@/components/MeasureView";
import { CvEditor } from "@/components/editor/CvEditor";
import { AppHeader } from "@/components/AppHeader";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ImportPdfDialog } from "@/components/ImportPdfDialog";
import { trackTemplateSwitch, trackFullscreenPreview } from "@/lib/analytics/gtag";
import { AlertTriangle, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullscreenPreviewDialog } from "@/components/FullscreenPreviewDialog";
import { useEditorLabels } from "@/hooks/useEditorLabels";
import { useCvState } from "@/hooks/useCvState";
import { useAutoFit } from "@/hooks/useAutoFit";
import { usePdfImport } from "@/hooks/usePdfImport";
import { usePdfExport } from "@/hooks/usePdfExport";

export default function MainPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const { editor, header, helpLabels, onboarding, importDialog } = useEditorLabels();

  // --- UI state ---
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isFromScratch, setIsFromScratch] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- Core CV state ---
  const {
    cv, setCv,
    templateId, setTemplateId,
    displaySettings, setDisplaySettings,
    templateMeta, renderModel,
    hadSavedSession,
  } = useCvState(!showOnboarding);

  // Hide onboarding when a saved session was restored
  const didSkipOnboarding = useMemo(() => hadSavedSession, [hadSavedSession]);
  const effectiveShowOnboarding = showOnboarding && !didSkipOnboarding;

  // --- Auto-fit ---
  const { metrics, setMetrics, isFitting, handleAutoFit } = useAutoFit(
    cv, setCv, templateMeta, displaySettings, setDisplaySettings,
  );

  // --- PDF import ---
  const handleImported = useCallback((parsed: Parameters<typeof setCv>[0]) => {
    setCv(parsed);
    setIsFromScratch(false);
    setShowImport(false);
  }, [setCv]);

  const { processing, handleFileSelected } = usePdfImport(handleImported);

  // --- PDF export ---
  const { downloading, handleDownloadPdf } = usePdfExport(cv.name, templateId);

  // --- Onboarding callbacks ---
  const handleStartFromScratch = useCallback(() => {
    setCv(createEmptyCvModel());
    setIsFromScratch(true);
  }, [setCv]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader
        title="Free Resume"
        locale={locale}
        onImportPdf={() => setShowImport(true)}
        onDownloadPdf={handleDownloadPdf}
        downloading={downloading}
        labels={header}
        helpLabels={helpLabels}
      />

      <main className="max-w-screen-2xl mx-auto px-6 py-8 flex flex-col lg:h-[calc(100vh-53px)]">
        {metrics && !metrics.fits && (
          <div className="print:hidden mb-4 flex items-center justify-between rounded-md px-3 py-2 text-sm bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {t("editor.visibility.overflows", { pages: String(metrics.estimatedPages) })}
              </span>
            </div>
            <button
              type="button"
              disabled={isFitting}
              onClick={handleAutoFit}
              className="ml-4 inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/70 transition-colors disabled:opacity-50"
            >
              {isFitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("editor.visibility.fitting")}
                </>
              ) : (
                t("editor.visibility.autoFit")
              )}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6 lg:min-h-0 lg:flex-1">
          <div className="print:hidden lg:overflow-y-auto lg:min-h-0">
            <CvEditor
              defaultValues={cv}
              onUpdate={setCv}
              displaySettings={displaySettings}
              onDisplaySettingsChange={setDisplaySettings}
              templateId={templateId}
              onTemplateSelect={(id: string) => { setTemplateId(id); trackTemplateSwitch(id); }}
              labels={editor}
            />
          </div>

          <div className="hidden lg:block lg:overflow-y-auto lg:min-h-0">
            {(() => {
              const trim = computeTrimInfo(cv, renderModel);
              const parts: string[] = [];
              if (trim.experienceHidden > 0)
                parts.push(`${renderModel.experience.length} of ${cv.experience.length} jobs`);
              if (trim.educationHidden > 0)
                parts.push(`${renderModel.education.length} of ${cv.education.length} education`);
              if (trim.skillsHidden > 0)
                parts.push(`${renderModel.skills.length} of ${cv.skills.length} skills`);
              if (trim.extrasHidden > 0) {
                const totalCv = cv.extras.reduce((s, g) => s + g.items.length, 0);
                const totalRender = renderModel.extras.reduce((s, g) => s + g.items.length, 0);
                parts.push(`${totalRender} of ${totalCv} extras`);
              }
              if (trim.summaryTruncated)
                parts.push("summary truncated");
              if (metrics && !metrics.fits)
                parts.push(`~${metrics.estimatedPages} pages`);
              if (parts.length === 0) return null;
              return (
                <div className="print:hidden mb-2 flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    {t("preview.trimWarning", { details: parts.join(", ") })}
                  </span>
                </div>
              );
            })()}
            <div className="relative">
              <Button
                variant="outline"
                size="icon-sm"
                className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => { setShowPreview(true); trackFullscreenPreview(); }}
                title={t("preview.fullscreen")}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <CvPreview renderModel={renderModel} templateId={templateId} />
            </div>
            <MeasureView templateId={templateId} renderModel={renderModel} onMeasure={setMetrics} />
          </div>
        </div>
      </main>

      {/* Onboarding */}
      {effectiveShowOnboarding && (
        <OnboardingWizard
          labels={onboarding}
          processing={processing}
          cv={cv}
          isFromScratch={isFromScratch}
          onFileSelected={handleFileSelected}
          onStartFromScratch={handleStartFromScratch}
          onComplete={handleOnboardingComplete}
        />
      )}

      <ImportPdfDialog
        open={showImport}
        onOpenChange={setShowImport}
        onFileSelected={handleFileSelected}
        processing={processing}
        labels={importDialog}
      />

      <FullscreenPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        renderModel={renderModel}
        templateId={templateId}
      />
    </div>
  );
}
