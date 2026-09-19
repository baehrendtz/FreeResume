"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { createEmptyCvModel } from "@/lib/model/CvModel";
import { createSampleCv, SAMPLE_TEMPLATE_ID } from "@/lib/sampleCv";
import { defaultDisplaySettings, twoPageDisplayDefaults } from "@/lib/model/DisplaySettings";
import type { CvLanguage } from "@/lib/cvLocale";
import { checkCv, type CvIssue } from "@/lib/cvChecks";
import { downloadCvFile } from "@/lib/export/cvFile";
import { cn } from "@/lib/utils";
import { CvPreview } from "@/components/CvPreview";
import { MeasureView } from "@/components/MeasureView";
import { TrimWarning } from "@/components/TrimWarning";
import { CvEditor } from "@/components/editor/CvEditor";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { StartScreen } from "@/components/start/StartScreen";
import { ResultView } from "@/components/result/ResultView";
import { ImportPdfDialog } from "@/components/ImportPdfDialog";
import { DownloadChecklistDialog } from "@/components/DownloadChecklistDialog";
import {
  trackTemplateSwitch,
  trackFullscreenPreview,
  trackCvFileSave,
  trackDownloadChecklist,
  trackOnboardingComplete,
} from "@/lib/analytics/gtag";
import { Download, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullscreenPreviewDialog } from "@/components/FullscreenPreviewDialog";
import { useEditorLabels } from "@/hooks/useEditorLabels";
import { useMounted } from "@/hooks/useMounted";
import { useCvState } from "@/hooks/useCvState";
import { useAutoFit } from "@/hooks/useAutoFit";
import { usePdfImport, type ImportResult } from "@/hooks/usePdfImport";
import { usePdfExport } from "@/hooks/usePdfExport";

/** start: how to upload. result: the finished CV right after an import. editor: step-by-step editing. */
type View = "start" | "result" | "editor";

export default function MainPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const { editor, header, helpLabels, importDialog, footer } = useEditorLabels();

  // --- UI state ---
  const [view, setView] = useState<View>("start");
  const [importSource, setImportSource] = useState<ImportResult["source"] | "sample">("pdf");
  const [showImport, setShowImport] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeStep, setActiveStep] = useState("basics");
  const [checklistIssues, setChecklistIssues] = useState<CvIssue[] | null>(null);

  // --- Core CV state ---
  const {
    cv, setCv,
    templateId, setTemplateId,
    displaySettings, setDisplaySettings,
    styleOverrides, setStyleOverrides,
    styleSettings,
    templateMeta, renderModel,
    hadSavedSession,
  } = useCvState(view !== "start");

  // The static export always prerenders the start screen, so the first client
  // render must match it. Only after mount may a restored session switch
  // straight to the editor (avoids a hydration mismatch).
  const mounted = useMounted();
  const effectiveView: View = !mounted ? "start" : view === "start" && hadSavedSession ? "editor" : view;

  const openEditor = useCallback((step: string) => {
    setActiveStep(step);
    setView("editor");
  }, []);

  // --- Auto-fit ---
  const { metrics, setMetrics, isFitting, handleAutoFit, requestAutoFit } = useAutoFit(
    cv, setCv, templateMeta, displaySettings, setDisplaySettings,
  );

  const handleUseTwoPages = useCallback(() => {
    setDisplaySettings((prev) => ({ ...prev, ...twoPageDisplayDefaults }));
  }, [setDisplaySettings]);

  // --- Import (LinkedIn PDF or saved CV file) ---
  const handleImported = useCallback((result: ImportResult) => {
    setCv(result.cv);
    if (result.source === "file") {
      // A saved CV file restores the user's own template and settings as they were
      setTemplateId(result.templateId);
      setDisplaySettings({ ...defaultDisplaySettings, ...result.displaySettings });
      setStyleOverrides(result.styleOverrides ?? {});
    } else {
      setDisplaySettings((prev) => ({ ...prev, cvLanguage: result.detectedLanguage }));
      // LinkedIn profiles are often long, shorten to the page target right away
      requestAutoFit();
      trackOnboardingComplete("upload");
    }
    setImportSource(result.source);
    setShowImport(false);
    setView("result");
  }, [setCv, setTemplateId, setDisplaySettings, setStyleOverrides, requestAutoFit]);

  const { processing, phase, error: importError, clearError: clearImportError, handleFileSelected } = usePdfImport(handleImported);

  // --- Export ---
  const { downloading, exportFailed, handleDownloadPdf } = usePdfExport(cv.name, templateId);

  // Run the quality checklist first, download straight away when nothing is missing
  const requestDownload = useCallback(() => {
    const issues = checkCv(cv);
    if (issues.length === 0) {
      handleDownloadPdf();
      return;
    }
    setChecklistIssues(issues);
    trackDownloadChecklist(issues.length);
  }, [cv, handleDownloadPdf]);

  const handleSaveFile = useCallback(() => {
    downloadCvFile({ cv, templateId, displaySettings, styleOverrides });
    trackCvFileSave();
  }, [cv, templateId, displaySettings, styleOverrides]);

  const handleStartFromScratch = useCallback(() => {
    setCv(createEmptyCvModel());
    // No PDF to detect the language from, so match the CV headings to the app language
    const cvLanguage: CvLanguage = locale === "sv" ? "sv" : "en";
    setDisplaySettings((prev) => ({ ...prev, cvLanguage }));
    clearImportError();
    trackOnboardingComplete("scratch");
    openEditor("basics");
  }, [setCv, setDisplaySettings, locale, clearImportError, openEditor]);

  // The example on the start screen, opened as a real CV so people can see the result without a PDF
  const handleTryExample = useCallback(() => {
    setCv(createSampleCv(locale));
    setTemplateId(SAMPLE_TEMPLATE_ID);
    const cvLanguage: CvLanguage = locale === "sv" ? "sv" : "en";
    setDisplaySettings((prev) => ({ ...prev, cvLanguage }));
    clearImportError();
    setImportSource("sample");
    trackOnboardingComplete("sample");
    setView("result");
  }, [setCv, setTemplateId, setDisplaySettings, locale, clearImportError]);

  const handleTemplateSelect = (id: string) => { setTemplateId(id); trackTemplateSwitch(id); };
  const openPreview = () => { setShowPreview(true); trackFullscreenPreview(); };

  // Rendered above the result and the editor so the notices are always in view
  const banner = (
    <>
      {exportFailed && (
        <div className="print:hidden mb-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          {t("actions.downloadError")}
        </div>
      )}
      <TrimWarning
        cv={cv}
        renderModel={renderModel}
        metrics={metrics}
        isFitting={isFitting}
        pageTarget={displaySettings.pageTarget}
        onAutoFit={handleAutoFit}
        onUseTwoPages={handleUseTwoPages}
        onEditLimits={() => openEditor("visibility")}
      />
    </>
  );

  const isEditor = effectiveView === "editor";

  return (
    <div className={cn("min-h-screen bg-background flex flex-col", isEditor && "lg:min-h-0 lg:h-screen lg:overflow-hidden")}>
      <AppHeader
        title="Free Resume"
        locale={locale}
        onImportPdf={() => setShowImport(true)}
        onDownloadPdf={requestDownload}
        onSaveFile={handleSaveFile}
        downloading={downloading}
        showActions={effectiveView !== "start"}
        labels={header}
        helpLabels={helpLabels}
      />

      <main className={cn("flex-1", isEditor && "lg:min-h-0 lg:overflow-hidden")}>
        {effectiveView === "start" && (
          <StartScreen
            processing={processing}
            phase={phase}
            error={importError}
            onFileSelected={handleFileSelected}
            onStartFromScratch={handleStartFromScratch}
            onTryExample={handleTryExample}
          />
        )}

        {effectiveView === "result" && (
          <ResultView
            cv={cv}
            source={importSource}
            renderModel={renderModel}
            templateId={templateId}
            onTemplateSelect={handleTemplateSelect}
            displaySettings={displaySettings}
            styleSettings={styleSettings}
            styleOverrides={styleOverrides}
            onStyleOverridesChange={setStyleOverrides}
            onMeasure={setMetrics}
            onDownload={requestDownload}
            downloading={downloading}
            onEdit={() => openEditor("basics")}
            banner={banner}
          />
        )}

        {isEditor && (
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 lg:pb-8 flex flex-col lg:h-full">
            {banner}
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
                  onTemplateSelect={handleTemplateSelect}
                  activeStep={activeStep}
                  onStepChange={setActiveStep}
                  onDownload={requestDownload}
                  downloading={downloading}
                  labels={editor}
                />
              </div>

              {/* Desktop: visible. Mobile: off-screen but in DOM for html2canvas + MeasureView */}
              <div className="max-lg:fixed max-lg:-left-[200vw] max-lg:w-[794px] lg:overflow-y-auto lg:min-h-0 min-w-0 lg:rounded-2xl lg:bg-desk lg:p-6">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm shadow-sm opacity-70 hover:opacity-100 transition-opacity"
                    onClick={openPreview}
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
      {isEditor && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur-sm border-t safe-area-pb">
          <div className="flex gap-2 max-w-lg mx-auto">
            {/* Live thumbnail so changes are visible without leaving the form. A plain
                button, the shared Button would resize the template's own icons. */}
            <button
              type="button"
              onClick={openPreview}
              className="flex flex-1 items-center gap-3 rounded-md border bg-background px-2 py-1.5 text-sm font-medium shadow-xs hover:bg-accent"
            >
              <span aria-hidden className="pointer-events-none w-8 shrink-0 overflow-hidden rounded-[2px]">
                <CvPreview renderModel={renderModel} templateId={templateId} styleSettings={styleSettings} />
              </span>
              {t("preview.show")}
            </button>
            <Button className="flex-1 h-auto" onClick={requestDownload} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {downloading ? t("actions.generating") : t("actions.downloadPdf")}
            </Button>
          </div>
        </div>
      )}

      {/* Extra bottom padding on mobile so the fixed action bar doesn't cover the footer links */}
      <AppFooter labels={footer} className={isEditor ? "pb-24 lg:pb-0" : undefined} />

      <ImportPdfDialog
        open={showImport}
        onOpenChange={(open) => { setShowImport(open); if (!open) clearImportError(); }}
        onFileSelected={handleFileSelected}
        processing={processing}
        error={importError}
        labels={importDialog}
      />

      <DownloadChecklistDialog
        issues={checklistIssues}
        onClose={() => setChecklistIssues(null)}
        onFix={(step) => { setChecklistIssues(null); openEditor(step); }}
        onDownloadAnyway={() => { setChecklistIssues(null); handleDownloadPdf(); }}
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
