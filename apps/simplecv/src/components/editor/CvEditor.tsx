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
import { TemplateStylePanel } from "./settings/TemplateStylePanel";
import { WIZARD_STEPS } from "@/lib/wizard/steps";
import { trackWizardStep, trackSkillAdd, trackSkillRemove } from "@/lib/analytics/gtag";
import type { PerTemplateStyleOverrides, TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getTemplateMeta } from "@/templates/templateRegistry";

interface CvEditorProps {
  defaultValues: CvModel;
  onUpdate: (cv: CvModel) => void;
  displaySettings?: DisplaySettings;
  onDisplaySettingsChange?: (s: DisplaySettings) => void;
  templateId: string;
  onTemplateSelect: (id: string) => void;
  styleOverrides?: PerTemplateStyleOverrides;
  styleSettings?: TemplateStyleValues;
  onStyleOverridesChange?: (overrides: PerTemplateStyleOverrides) => void;
  labels: {
    tabs: {
      template: string;
      basics: string;
      summary: string;
      experience: string;
      education: string;
      skills: string;
      languages: string;
      extras: string;
      visibility: string;
    };
    groups: {
      theme: string;
      content: string;
      settings: string;
    };
    basics: {
      name: string;
      nameRequired: string;
      headline: string;
      email: string;
      phone: string;
      location: string;
      linkedIn: string;
      website: string;
      photo: string;
      photoUpload: string;
      photoRemove: string;
      photoTooLarge: string;
    };
    summary: { label: string; placeholder: string };
    experience: {
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      datePlaceholder: string;
      endDatePlaceholder: string;
      description: string;
      bullets: string;
      bulletsHint: string;
      add: string;
      remove: string;
      hide: string;
      show: string;
      at: string;
      emptyState: string;
      confirm: string;
      moveUp: string;
      moveDown: string;
    };
    education: {
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      datePlaceholder: string;
      endDatePlaceholder: string;
      description: string;
      add: string;
      remove: string;
      hide: string;
      show: string;
      emptyState: string;
      confirm: string;
      moveUp: string;
      moveDown: string;
    };
    skills: { label: string; placeholder: string; add: string; emptyState: string; duplicateWarning: string };
    languages: {
      label: string;
      placeholder: string;
      add: string;
      levelLabel: string;
      native: string;
      full_professional: string;
      professional_working: string;
      limited_working: string;
      elementary: string;
      noResults: string;
      emptyState: string;
    };
    extras: { label: string; placeholder: string; add: string; addCategory: string; removeCategory: string; emptyState: string };
    extrasCategories: Record<string, string>;
    style: {
      styleTitle: string;
      styleDescription: string;
      accentColor: string;
      secondaryColor: string;
      photoSize: string;
      fontScale: string;
      photoShape: string;
      photoShapeCircle: string;
      photoShapeRounded: string;
      photoShapeSquare: string;
      sidebarBgColor: string;
      lineHeight: string;
      resetDefaults: string;
    };
    visibility: {
      title: string;
      description: string;
      photo: string;
      summary: string;
      experience: string;
      education: string;
      skills: string;
      languages: string;
      extras: string;
      contentLimitsTitle: string;
      contentLimitsDescription: string;
      maxExperience: string;
      maxEducation: string;
      maxSkills: string;
      maxBulletsPerJob: string;
      summaryMaxChars: string;
      maxExtras: string;
      simplifyLocationsTitle: string;
      simplifyLocationsDescription: string;
      simplifyLocations: string;
      cvLanguageTitle: string;
      cvLanguageDescription: string;
      cvLanguageEn: string;
      cvLanguageSv: string;
      template: string;
    };
  };
}

export function CvEditor({
  defaultValues,
  onUpdate,
  displaySettings,
  onDisplaySettingsChange,
  templateId,
  onTemplateSelect,
  styleOverrides,
  styleSettings,
  onStyleOverridesChange,
  labels,
}: CvEditorProps) {
  const [activeStep, setActiveStep] = useState("basics");
  const [collapsed, setCollapsed] = useState(false);
  const formContentRef = useRef<HTMLDivElement>(null);

  const methods = useForm<CvModel>({
    defaultValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zod v4.3 internal version mismatch with @hookform/resolvers
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
      }, 150);
    },
    [onUpdate]
  );

  useEffect(() => {
    const subscription = methods.watch((data) => {
      handleUpdate(data as CvModel);
    });
    return () => subscription.unsubscribe();
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
      <form ref={formRef}>
        <div className="flex flex-col md:flex-row">
          <WizardSidebar
            activeStep={activeStep}
            onStepSelect={handleStepSelect}
            tabLabels={labels.tabs}
            groupLabels={labels.groups}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />

          {/* Form content */}
          <div ref={formContentRef} className="flex-1 md:pl-4 min-w-0 pt-2 md:pt-0">
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
                {styleOverrides && styleSettings && onStyleOverridesChange && (
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
                )}
              </div>
            )}
            {activeStep === "visibility" && (
              <div className="space-y-4">
                {displaySettings && onDisplaySettingsChange && (
                  <CvLanguageSetting labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
                )}
                <SectionToggles labels={labels.visibility} />
                {displaySettings && onDisplaySettingsChange && (
                  <>
                    <ContentLimits labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
                    <LocationFormatting labels={labels.visibility} displaySettings={displaySettings} onDisplaySettingsChange={onDisplaySettingsChange} />
                  </>
                )}
              </div>
            )}
            {activeStep === "basics" && <BasicsForm labels={labels.basics} />}
            {activeStep === "summary" && (
              <SummaryForm
                label={labels.summary.label}
                placeholder={labels.summary.placeholder}
                maxChars={displaySettings?.summaryMaxChars}
              />
            )}
            {activeStep === "experience" && <ExperienceForm labels={labels.experience} />}
            {activeStep === "education" && <EducationForm labels={labels.education} />}
            {activeStep === "skills" && (
              <ListForm fieldName="skills" labels={labels.skills} onAdd={trackSkillAdd} onRemove={trackSkillRemove} />
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
