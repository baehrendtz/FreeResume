"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { createEmptyCvModel } from "@/lib/model/CvModel";
import { CvPreview } from "@/components/CvPreview";
import { MeasureView } from "@/components/MeasureView";
import { TrimWarning } from "@/components/TrimWarning";
import { CvEditor } from "@/components/editor/CvEditor";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { ImportPdfDialog } from "@/components/ImportPdfDialog";
import { trackTemplateSwitch, trackFullscreenPreview } from "@/lib/analytics/gtag";
import { Download, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullscreenPreviewDialog } from "@/components/FullscreenPreviewDialog";
import { useEditorLabels } from "@/hooks/useEditorLabels";
import { useMounted } from "@/hooks/useMounted";
import { useCvState } from "@/hooks/useCvState";
import { useAutoFit } from "@/hooks/useAutoFit";
import { usePdfImport } from "@/hooks/usePdfImport";
import { usePdfExport } from "@/hooks/usePdfExport";

export default function MainPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const { editor, header, helpLabels, onboarding, importDialog, footer } = useEditorLabels();

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
    styleOverrides, setStyleOverrides,
    styleSettings,
    templateMeta, renderModel,
    hadSavedSession,
  } = useCvState(!showOnboarding);

  // The static export always prerenders the onboarding view, so the first
  // client render must match it, only after mount may a restored session
  // switch straight to the editor (avoids a hydration mismatch).
  const mounted = useMounted();

  // Hide onboarding when a saved session was restored
  const effectiveShowOnboarding = !mounted || (showOnboarding && !hadSavedSession);

  // --- Auto-fit ---
  const { metrics, setMetrics, isFitting, handleAutoFit } = useAutoFit(
    cv, setCv, templateMeta, displaySettings, setDisplaySettings,
  );

  // --- PDF import ---
  const handleImported = useCallback((result: import("@/lib/parser/linkedinParser").ParseResult) => {
    setCv(result.cv);
    setDisplaySettings((prev) => ({ ...prev, cvLanguage: result.detectedLanguage }));
    setIsFromScratch(false);
    setShowImport(false);
  }, [setCv, setDisplaySettings]);

  const { processing, error: pdfError, clearError: clearPdfError, handleFileSelected } = usePdfImport(handleImported);

  // --- PDF export ---
  const { downloading, exportFailed, handleDownloadPdf } = usePdfExport(cv.name, templateId);

  // --- Onboarding callbacks ---
  const handleStartFromScratch = useCallback(() => {
    setCv(createEmptyCvModel());
    setIsFromScratch(true);
  }, [setCv]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return (
    <div className="min-h-screen lg:min-h-0 lg:h-screen lg:overflow-hidden bg-muted/30 flex flex-col">
      <AppHeader
        title="Free Resume"
        locale={locale}
        onImportPdf={() => setShowImport(true)}
        onDownloadPdf={handleDownloadPdf}
        downloading={downloading}
        showActions={!effectiveShowOnboarding}
        labels={header}
        helpLabels={helpLabels}
      />

      <main className="flex-1 lg:min-h-0 lg:overflow-hidden">
        {effectiveShowOnboarding ? (
          <OnboardingWizard
            labels={onboarding}
            processing={processing}
            pdfError={pdfError}
            onClearError={clearPdfError}
            cv={cv}
            isFromScratch={isFromScratch}
            onFileSelected={handleFileSelected}
            onStartFromScratch={handleStartFromScratch}
            onComplete={handleOnboardingComplete}
          />
        ) : (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8 flex flex-col lg:h-full">
            {exportFailed && (
              <div className="print:hidden mb-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                {t("actions.downloadError")}
              </div>
            )}
            {/* Rendered above the grid so the warning (and auto-fit) is
                visible on mobile, where the preview column is off-screen */}
            <TrimWarning
              cv={cv}
              renderModel={renderModel}
              metrics={metrics}
              isFitting={isFitting}
              onAutoFit={handleAutoFit}
            />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:min-h-0 lg:flex-1">
              <div className="print:hidden lg:overflow-y-auto lg:min-h-0 min-w-0">
                <CvEditor
                  defaultValues={cv}
                  onUpdate={setCv}
                  settings={{
                    displaySettings, onDisplaySettingsChange: setDisplaySettings,
                    styleOverrides, styleSettings,
                    onStyleOverridesChange: setStyleOverrides,
                  }}
                  templateId={templateId}
                  onTemplateSelect={(id: string) => { setTemplateId(id); trackTemplateSwitch(id); }}
                  labels={editor}
                />
              </div>

              {/* Desktop: visible. Mobile: off-screen but in DOM for html2canvas + MeasureView */}
              <div className="max-lg:fixed max-lg:-left-[200vw] max-lg:w-[794px] lg:overflow-y-auto lg:min-h-0 min-w-0">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => { setShowPreview(true); trackFullscreenPreview(); }}
                    title={t("preview.fullscreen")}
                    aria-label={t("preview.fullscreen")}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </Button>
                  <CvPreview renderModel={renderModel} templateId={templateId} styleSettings={styleSettings} pageTarget={displaySettings.pageTarget} exportSource />
                </div>
                <MeasureView templateId={templateId} renderModel={renderModel} onMeasure={setMetrics} styleSettings={styleSettings} pageTarget={displaySettings.pageTarget} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile floating action bar */}
      {!effectiveShowOnboarding && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur-sm border-t safe-area-pb">
          <div className="flex gap-2 max-w-lg mx-auto">
            <Button variant="outline" className="flex-1" onClick={() => { setShowPreview(true); trackFullscreenPreview(); }}>
              <Maximize2 className="h-4 w-4 mr-2" /> {t("preview.fullscreen")}
            </Button>
            <Button className="flex-1" onClick={handleDownloadPdf} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {downloading ? t("actions.generating") : t("actions.downloadPdf")}
            </Button>
          </div>
        </div>
      )}

      {/* Extra bottom padding on mobile so the fixed action bar doesn't cover the footer links */}
      <AppFooter labels={footer} className={effectiveShowOnboarding ? undefined : "pb-20 lg:pb-0"} />

      <ImportPdfDialog
        open={showImport}
        onOpenChange={(open) => { setShowImport(open); if (!open) clearPdfError(); }}
        onFileSelected={handleFileSelected}
        processing={processing}
        error={pdfError}
        labels={importDialog}
      />

      <FullscreenPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        renderModel={renderModel}
        templateId={templateId}
        styleSettings={styleSettings}
        pageTarget={displaySettings.pageTarget}
      />
    </div>
  );
}
