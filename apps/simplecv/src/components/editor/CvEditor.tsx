"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Download, Loader2, Settings } from "lucide-react";
import { type CvModel, cvModelSchema } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import { Button } from "@/components/ui/button";
import { WizardSidebar } from "./WizardSidebar";
import { BasicsForm } from "./BasicsForm";
import { SummaryForm } from "./SummaryForm";
import { ExperienceForm } from "./ExperienceForm";
import { EducationForm } from "./EducationForm";
import { ListForm } from "./ListForm";
import { LanguageForm } from "./LanguageForm";
import { ExtrasForm } from "./ExtrasForm";
import { TemplateSwitcher } from "@/components/TemplateSwitcher";
import { SectionToggles } from "./settings/SectionToggles";
import { ContentLimits } from "./settings/ContentLimits";
import { LocationFormatting } from "./settings/LocationFormatting";
import { CvLanguageSetting } from "./settings/CvLanguageSetting";
import { PageTargetSetting } from "./settings/PageTargetSetting";
import { TemplateStylePanel } from "./settings/TemplateStylePanel";
import { WIZARD_STEPS, STEP_ORDER } from "@/lib/wizard/steps";
import { trackWizardStep, trackSkillAdd, trackSkillRemove } from "@/lib/analytics/gtag";
import type { PerTemplateStyleOverrides, TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getTemplateMeta } from "@/templates/templateRegistry";
import { FORM_DEBOUNCE_MS, STICKY_HEADER_OFFSET_PX } from "@/lib/constants";
import type { useEditorLabels } from "@/hooks/useEditorLabels";

export interface EditorSettings {
  displaySettings: DisplaySettings;
  onDisplaySettingsChange: (s: DisplaySettings) => void;
  styleOverrides: PerTemplateStyleOverrides;
  styleSettings: TemplateStyleValues;
  onStyleOverridesChange: (overrides: PerTemplateStyleOverrides) => void;
}

/** The full editor label tree comes from useEditorLabels, typed from the
 *  hook so the two can never drift apart. */
export type EditorLabels = ReturnType<typeof useEditorLabels>["editor"];

interface CvEditorProps {
  defaultValues: CvModel;
  onUpdate: (cv: CvModel) => void;
  settings: EditorSettings;
  templateId: string;
  onTemplateSelect: (id: string) => void;
  activeStep: string;
  onStepChange: (id: string) => void;
  onDownload: () => void;
  downloading: boolean;
  labels: EditorLabels;
}

export function CvEditor({
  defaultValues,
  onUpdate,
  settings,
  templateId,
  onTemplateSelect,
  activeStep,
  onStepChange,
  onDownload,
  downloading,
  labels,
}: CvEditorProps) {
  const { displaySettings, onDisplaySettingsChange, styleOverrides, styleSettings, onStyleOverridesChange } = settings;
  const [collapsed, setCollapsed] = useState(false);

  const methods = useForm<CvModel>({
    defaultValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zod v4.3 internal version mismatch with @hookform/resolvers. TODO: Remove cast when @hookform/resolvers supports zod v4 natively
    resolver: zodResolver(cvModelSchema as any),
    mode: "onChange",
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const skipNextReset = useRef(false);

  const handleUpdate = useCallback(
    (data: CvModel) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        skipNextReset.current = true;
        onUpdate(data);
      }, FORM_DEBOUNCE_MS);
    },
    [onUpdate]
  );

  useEffect(() => {
    const subscription = methods.watch((data, { name }) => {
      // Reset-triggered notifications have no field name, skipping them
      // stops external updates (import, auto-fit, session restore) from
      // being echoed straight back to the parent as a redundant setCv.
      if (name === undefined) return;
      handleUpdate(data as CvModel);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [methods, handleUpdate]);

  // Reset form only for external changes (PDF upload, auto-fit, session restore)
  useEffect(() => {
    if (skipNextReset.current) {
      skipNextReset.current = false;
      return;
    }
    methods.reset(defaultValues);
  }, [defaultValues, methods]);

  const formRef = useRef<HTMLFormElement>(null);

  const goToStep = useCallback((id: string) => {
    onStepChange(id);
    trackWizardStep(id);
    const form = formRef.current;
    if (!form) return;
    // Desktop: the editor column scrolls, jump it back to the top
    form.parentElement?.scrollTo({ top: 0, behavior: "smooth" });
    // Mobile: the page scrolls, bring the new step into view when the user
    // pressed "Next" further down the form
    const top = form.getBoundingClientRect().top;
    if (top < 0) {
      window.scrollTo({ top: window.scrollY + top - STICKY_HEADER_OFFSET_PX, behavior: "smooth" });
    }
  }, [onStepChange]);

  const StepIcon = WIZARD_STEPS.find((s) => s.id === activeStep)?.icon;
  const stepIndex = STEP_ORDER.indexOf(activeStep);
  const prevStep = STEP_ORDER[stepIndex - 1];
  const nextStep = STEP_ORDER[stepIndex + 1];
  // The content steps lead up to the template step, where the CV is ready to
  // download. Settings follow it as an optional extra.
  const isFinishStep = activeStep === "template" || activeStep === "visibility";
  const tabLabel = (id: string) => labels.tabs[id as keyof typeof labels.tabs];
  const templateMeta = getTemplateMeta(templateId);

  return (
    <FormProvider {...methods}>
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row">
          <WizardSidebar
            activeStep={activeStep}
            onStepSelect={goToStep}
            tabLabels={labels.tabs}
            groupLabels={labels.groups}
            sidebarLabels={labels.sidebar}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />

          {/* Form content */}
          <div className="flex-1 md:pl-4 min-w-0 pt-2 md:pt-0">
            {StepIcon && (
              <div className="mb-4 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {labels.nav.stepOf(stepIndex + 1, STEP_ORDER.length)}
                </p>
                <div className="flex items-center gap-2">
                  <StepIcon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{tabLabel(activeStep)}</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {labels.hints[activeStep as keyof typeof labels.hints]}
                </p>
              </div>
            )}
            {activeStep === "template" && (
              <div className="space-y-4">
                <TemplateSwitcher
                  activeId={templateId}
                  onSelect={onTemplateSelect}
                  cv={defaultValues}
                  displaySettings={displaySettings}
                  styleOverrides={styleOverrides}
                />
                <TemplateStylePanel
                  templateId={templateId}
                  styleSettings={styleSettings}
                  styleOverrides={styleOverrides}
                  onStyleOverridesChange={onStyleOverridesChange}
                  supportsPhoto={templateMeta.capabilities.supportsPhoto}
                  supportsSidebar={templateMeta.capabilities.supportsSidebar}
                  supportsSecondaryColor={templateMeta.capabilities.supportsSecondaryColor}
                  labels={labels.style}
                />
              </div>
            )}
            {activeStep === "visibility" && (
              <div className="space-y-4">
                <CvLanguageSetting labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
                <SectionToggles labels={labels.visibility} />
                <PageTargetSetting labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
                <ContentLimits labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
                <LocationFormatting labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
              </div>
            )}
            {activeStep === "basics" && <BasicsForm labels={labels.basics} />}
            {activeStep === "summary" && (
              <SummaryForm
                label={labels.summary.label}
                placeholder={labels.summary.placeholder}
                maxChars={displaySettings.summaryMaxChars}
              />
            )}
            {activeStep === "experience" && <ExperienceForm labels={labels.experience} />}
            {activeStep === "education" && <EducationForm labels={labels.education} />}
            {activeStep === "skills" && (
              <ListForm labels={labels.skills} onAdd={trackSkillAdd} onRemove={trackSkillRemove} />
            )}
            {activeStep === "languages" && (
              <LanguageForm labels={labels.languages} />
            )}
            {activeStep === "extras" && (
              <ExtrasForm labels={labels.extras} categoryNames={labels.extrasCategories} />
            )}

            {/* Step navigation */}
            <div className="mt-8 space-y-3 border-t pt-4">
              {isFinishStep && (
                <p className="text-sm text-muted-foreground">{labels.nav.finishHint}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {prevStep && (
                  <Button type="button" variant="ghost" onClick={() => goToStep(prevStep)}>
                    <ChevronLeft className="h-4 w-4" />
                    {labels.nav.previous}
                  </Button>
                )}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {activeStep === "template" && nextStep && (
                    <Button type="button" variant="outline" onClick={() => goToStep(nextStep)}>
                      <Settings className="h-4 w-4" />
                      {labels.nav.moreSettings}
                    </Button>
                  )}
                  {isFinishStep ? (
                    <Button type="button" onClick={onDownload} disabled={downloading}>
                      {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      {downloading ? labels.nav.generating : labels.nav.download}
                    </Button>
                  ) : (
                    nextStep && (
                      <Button type="button" onClick={() => goToStep(nextStep)}>
                        {labels.nav.next(tabLabel(nextStep))}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
