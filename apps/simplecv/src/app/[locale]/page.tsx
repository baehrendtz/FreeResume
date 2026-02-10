"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { type CvModel, createEmptyCvModel } from "@/lib/model/CvModel";
import { type DisplaySettings, defaultDisplaySettings, computeTrimInfo } from "@/lib/model/DisplaySettings";
import type { LayoutMetrics } from "@/lib/fitting/types";
import { buildRenderModel, fitToTemplate } from "@/lib/fitting";
import { getTemplateMeta } from "@/templates/templateRegistry";
import { CvPreview } from "@/components/CvPreview";
import { MeasureView } from "@/components/MeasureView";
import { CvEditor } from "@/components/editor/CvEditor";

import { AppHeader } from "@/components/AppHeader";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { ImportPdfDialog } from "@/components/ImportPdfDialog";
import { downloadPdf, saveSession, loadSession } from "@/lib/export/printHelpers";
import { trackPdfUpload, trackPdfDownload, trackTemplateSwitch, trackStartFromScratch, trackAutoFit, trackFullscreenPreview } from "@/lib/analytics/gtag";
import { AlertTriangle, Loader2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FullscreenPreviewDialog } from "@/components/FullscreenPreviewDialog";

const MAX_FIT_ITERATIONS = 20;

export default function MainPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [cv, setCv] = useState<CvModel>(createEmptyCvModel);
  const [processing, setProcessing] = useState(false);
  const [templateId, setTemplateId] = useState("basic");
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
  const [metrics, setMetrics] = useState<LayoutMetrics | null>(null);
  const [isFitting, setIsFitting] = useState(false);
  const fittingIterRef = useRef(0);

  // Refs for stable access inside the fitting effect
  const cvRef = useRef(cv);
  cvRef.current = cv;
  const settingsRef = useRef(displaySettings);
  settingsRef.current = displaySettings;

  const templateMeta = useMemo(() => getTemplateMeta(templateId), [templateId]);
  const renderModel = useMemo(
    () => buildRenderModel(cv, templateMeta, displaySettings),
    [cv, templateMeta, displaySettings],
  );

  // Restore session on mount
  const didRestore = useRef(false);
  useEffect(() => {
    if (didRestore.current) return;
    didRestore.current = true;
    const session = loadSession();
    if (session) {
      // Migrate old flat string[] extras to grouped format
      const extras = session.cv.extras as unknown;
      if (Array.isArray(extras) && extras.length > 0 && typeof extras[0] === "string") {
        session.cv.extras = [{ category: "other", items: extras as string[] }];
      }
      setCv(session.cv);
      setTemplateId(session.templateId);
      setDisplaySettings(session.displaySettings ?? defaultDisplaySettings);
      setShowOnboarding(false);
    }
  }, []);

  // Save session whenever edit state changes
  useEffect(() => {
    if (!showOnboarding) {
      saveSession({ cv, templateId, displaySettings });
    }
  }, [cv, showOnboarding, templateId, displaySettings]);

  const handleFileSelected = useCallback(async (file: File) => {
    setProcessing(true);
    try {
      const { extractText } = await import("@/lib/pdf/extractText");
      const pages = await extractText(file);

      const { parseLinkedInPdf } = await import("@/lib/parser/linkedinParser");
      const parsed = parseLinkedInPdf(pages);
      setCv(parsed);
      setShowOnboarding(false);
      setShowImport(false);
      trackPdfUpload("success");
    } catch (err) {
      console.error("Failed to process PDF:", err);
      trackPdfUpload("failure");
    } finally {
      setProcessing(false);
    }
  }, []);

  const handleStartFromScratch = useCallback(() => {
    setCv(createEmptyCvModel());
    setShowOnboarding(false);
    trackStartFromScratch();
  }, []);

  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    setDownloading(true);
    try {
      await downloadPdf(cv.name);
      trackPdfDownload(templateId);
    } finally {
      setDownloading(false);
    }
  }, [cv.name, templateId]);

  // --- Auto-fit ---

  const handleAutoFit = useCallback(() => {
    if (!metrics || metrics.fits) return;
    trackAutoFit();
    fittingIterRef.current = 0;
    setIsFitting(true);

    const result = fitToTemplate(cvRef.current, templateMeta, settingsRef.current, metrics);
    if (!result) {
      setIsFitting(false);
      return;
    }
    setDisplaySettings(result.displaySettings);
    if (Object.keys(result.visibilityOverrides).length > 0) {
      setCv((prev) => ({
        ...prev,
        sectionsVisibility: { ...prev.sectionsVisibility, ...result.visibilityOverrides },
      }));
    }
  }, [metrics, templateMeta]);

  // Fitting continuation
  useEffect(() => {
    if (!isFitting || !metrics) return;

    if (metrics.fits) {
      setIsFitting(false);
      return;
    }

    fittingIterRef.current += 1;
    if (fittingIterRef.current >= MAX_FIT_ITERATIONS) {
      setIsFitting(false);
      return;
    }

    const result = fitToTemplate(cvRef.current, templateMeta, settingsRef.current, metrics);
    if (!result) {
      setIsFitting(false);
      return;
    }

    setDisplaySettings(result.displaySettings);
    if (Object.keys(result.visibilityOverrides).length > 0) {
      setCv((prev) => ({
        ...prev,
        sectionsVisibility: { ...prev.sectionsVisibility, ...result.visibilityOverrides },
      }));
    }
  }, [metrics, isFitting, templateMeta]);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader
        title={t("app.title")}
        locale={locale}
        onImportPdf={() => setShowImport(true)}
        onDownloadPdf={handleDownloadPdf}
        downloading={downloading}
        labels={{
          importPdf: t("actions.importPdf"),
          downloadPdf: t("actions.downloadPdf"),
          generating: t("actions.generating"),
          moreActions: t("actions.moreActions"),
          themeToggle: t("theme.toggle"),
          help: t("help.trigger"),
        }}
        helpLabels={{
          title: t("help.title"),
          intro: t("help.intro"),
          howItWorksTitle: t("help.howItWorksTitle"),
          step1: t("help.step1"),
          step2: t("help.step2"),
          step3: t("help.step3"),
          downloadTitle: t("help.downloadTitle"),
          downloadText: t("help.downloadText"),
          dataTitle: t("help.dataTitle"),
          dataText: t("help.dataText"),
          footer: t("help.footer"),
        }}
      />

      {/* Main Content — editor always rendered */}
      <main className="max-w-screen-2xl mx-auto px-6 py-8 flex flex-col lg:h-[calc(100vh-53px)]">
        {/* Overflow warning bar */}
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
              labels={{
                tabs: {
                  basics: t("editor.tabs.basics"),
                  summary: t("editor.tabs.summary"),
                  experience: t("editor.tabs.experience"),
                  education: t("editor.tabs.education"),
                  skills: t("editor.tabs.skills"),
                  languages: t("editor.tabs.languages"),
                  extras: t("editor.tabs.extras"),
                  visibility: t("editor.tabs.visibility"),
                },
                basics: {
                  name: t("editor.basics.name"),
                  headline: t("editor.basics.headline"),
                  email: t("editor.basics.email"),
                  phone: t("editor.basics.phone"),
                  location: t("editor.basics.location"),
                  linkedIn: t("editor.basics.linkedIn"),
                  website: t("editor.basics.website"),
                  photo: t("editor.basics.photo"),
                  photoUpload: t("editor.basics.photoUpload"),
                  photoRemove: t("editor.basics.photoRemove"),
                },
                summary: {
                  label: t("editor.summary.label"),
                  placeholder: t("editor.summary.placeholder"),
                },
                experience: {
                  title: t("editor.experience.title"),
                  company: t("editor.experience.company"),
                  location: t("editor.experience.location"),
                  startDate: t("editor.experience.startDate"),
                  endDate: t("editor.experience.endDate"),
                  description: t("editor.experience.description"),
                  bullets: t("editor.experience.bullets"),
                  add: t("editor.experience.add"),
                  remove: t("editor.experience.remove"),
                  hide: t("editor.experience.hide"),
                  show: t("editor.experience.show"),
                },
                education: {
                  institution: t("editor.education.institution"),
                  degree: t("editor.education.degree"),
                  field: t("editor.education.field"),
                  startDate: t("editor.education.startDate"),
                  endDate: t("editor.education.endDate"),
                  description: t("editor.education.description"),
                  add: t("editor.education.add"),
                  remove: t("editor.education.remove"),
                  hide: t("editor.education.hide"),
                  show: t("editor.education.show"),
                },
                skills: {
                  label: t("editor.skills.label"),
                  placeholder: t("editor.skills.placeholder"),
                  add: t("editor.skills.add"),
                },
                languages: {
                  label: t("editor.languages.label"),
                  placeholder: t("editor.languages.placeholder"),
                  add: t("editor.languages.add"),
                },
                extras: {
                  label: t("editor.extras.label"),
                  placeholder: t("editor.extras.placeholder"),
                  add: t("editor.extras.add"),
                  addCategory: t("editor.extras.addCategory"),
                  removeCategory: t("editor.extras.removeCategory"),
                },
                extrasCategories: {
                  certifications: t("editor.extrasCategories.certifications"),
                  honors: t("editor.extrasCategories.honors"),
                  publications: t("editor.extrasCategories.publications"),
                  volunteering: t("editor.extrasCategories.volunteering"),
                  organizations: t("editor.extrasCategories.organizations"),
                  courses: t("editor.extrasCategories.courses"),
                  projects: t("editor.extrasCategories.projects"),
                  patents: t("editor.extrasCategories.patents"),
                  other: t("editor.extrasCategories.other"),
                },
                visibility: {
                  title: t("editor.visibility.title"),
                  description: t("editor.visibility.description"),
                  summary: t("editor.visibility.summary"),
                  experience: t("editor.visibility.experience"),
                  education: t("editor.visibility.education"),
                  skills: t("editor.visibility.skills"),
                  languages: t("editor.visibility.languages"),
                  extras: t("editor.visibility.extras"),
                  contentLimitsTitle: t("editor.visibility.contentLimitsTitle"),
                  contentLimitsDescription: t("editor.visibility.contentLimitsDescription"),
                  maxExperience: t("editor.visibility.maxExperience"),
                  maxEducation: t("editor.visibility.maxEducation"),
                  maxSkills: t("editor.visibility.maxSkills"),
                  maxBulletsPerJob: t("editor.visibility.maxBulletsPerJob"),
                  summaryMaxChars: t("editor.visibility.summaryMaxChars"),
                  maxExtras: t("editor.visibility.maxExtras"),
                  simplifyLocationsTitle: t("editor.visibility.simplifyLocationsTitle"),
                  simplifyLocationsDescription: t("editor.visibility.simplifyLocationsDescription"),
                  simplifyLocations: t("editor.visibility.simplifyLocations"),
                  template: t("editor.visibility.template"),
                },
              }}
            />
          </div>

          {/* Preview ~25% */}
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

      {/* Dialogs */}
      <OnboardingDialog
        open={showOnboarding}
        onFileSelected={handleFileSelected}
        onStartFromScratch={handleStartFromScratch}
        labels={{
          title: t("onboarding.title"),
          description: t("onboarding.description"),
          uploadTitle: t("onboarding.uploadTitle"),
          uploadDescription: t("onboarding.uploadDescription"),
          scratchTitle: t("onboarding.scratchTitle"),
          scratchDescription: t("onboarding.scratchDescription"),
        }}
      />

      <ImportPdfDialog
        open={showImport}
        onOpenChange={setShowImport}
        onFileSelected={handleFileSelected}
        processing={processing}
        labels={{
          title: t("actions.importPdf"),
          warning: t("actions.importWarning"),
          dropzone: t("upload.dropzone"),
          processing: t("upload.processing"),
          cancel: t("actions.cancel"),
        }}
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
