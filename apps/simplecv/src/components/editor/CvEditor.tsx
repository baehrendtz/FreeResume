"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CvModel, cvModelSchema } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
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
import { WIZARD_STEPS } from "@/lib/wizard/steps";
import { trackWizardStep, trackSkillAdd, trackSkillRemove } from "@/lib/analytics/gtag";
import type { PerTemplateStyleOverrides, TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getTemplateMeta } from "@/templates/templateRegistry";
import { FORM_DEBOUNCE_MS } from "@/lib/constants";
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
  labels: EditorLabels;
}

export function CvEditor({
  defaultValues,
  onUpdate,
  settings,
  templateId,
  onTemplateSelect,
  labels,
}: CvEditorProps) {
  const { displaySettings, onDisplaySettingsChange, styleOverrides, styleSettings, onStyleOverridesChange } = settings;
  const [activeStep, setActiveStep] = useState("basics");
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

  const handleStepSelect = useCallback((id: string) => {
    setActiveStep(id);
    trackWizardStep(id);
    // Scroll the editor column (form's parent) to top on step change
    formRef.current?.parentElement?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <FormProvider {...methods}>
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col md:flex-row">
          <WizardSidebar
            activeStep={activeStep}
            onStepSelect={handleStepSelect}
            tabLabels={labels.tabs}
            groupLabels={labels.groups}
            sidebarLabels={labels.sidebar}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />

          {/* Form content */}
          <div className="flex-1 md:pl-4 min-w-0 pt-2 md:pt-0">
            {(() => {
              const step = WIZARD_STEPS.find((s) => s.id === activeStep);
              if (!step) return null;
              const Icon = step.icon;
              return (
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{labels.tabs[activeStep as keyof typeof labels.tabs]}</h2>
                </div>
              );
            })()}
            {activeStep === "template" && (
              <div className="space-y-4">
                <TemplateSwitcher activeId={templateId} onSelect={onTemplateSelect} />
                <TemplateStylePanel
                  templateId={templateId}
                  styleSettings={styleSettings}
                  styleOverrides={styleOverrides}
                  onStyleOverridesChange={onStyleOverridesChange}
                  supportsPhoto={getTemplateMeta(templateId).capabilities.supportsPhoto}
                  supportsSidebar={getTemplateMeta(templateId).capabilities.supportsSidebar}
                  supportsSecondaryColor={getTemplateMeta(templateId).capabilities.supportsSecondaryColor}
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
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
