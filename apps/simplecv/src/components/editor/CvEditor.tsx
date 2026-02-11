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
import { SkillsForm } from "./SkillsForm";
import { LanguagesForm } from "./LanguagesForm";
import { ExtrasForm } from "./ExtrasForm";
import { SectionVisibilityToggles } from "./SectionVisibilityToggles";
import { WIZARD_STEPS } from "@/lib/wizard/steps";
import { trackWizardStep } from "@/lib/analytics/gtag";

interface CvEditorProps {
  defaultValues: CvModel;
  onUpdate: (cv: CvModel) => void;
  displaySettings?: DisplaySettings;
  onDisplaySettingsChange?: (s: DisplaySettings) => void;
  templateId: string;
  onTemplateSelect: (id: string) => void;
  labels: {
    tabs: {
      basics: string;
      summary: string;
      experience: string;
      education: string;
      skills: string;
      languages: string;
      extras: string;
      visibility: string;
    };
    basics: {
      name: string;
      headline: string;
      email: string;
      phone: string;
      location: string;
      linkedIn: string;
      website: string;
      photo: string;
      photoUpload: string;
      photoRemove: string;
    };
    summary: { label: string; placeholder: string };
    experience: {
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
      bullets: string;
      add: string;
      remove: string;
      hide: string;
      show: string;
    };
    education: {
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      description: string;
      add: string;
      remove: string;
      hide: string;
      show: string;
    };
    skills: { label: string; placeholder: string; add: string };
    languages: { label: string; placeholder: string; add: string };
    extras: { label: string; placeholder: string; add: string; addCategory: string; removeCategory: string };
    extrasCategories: Record<string, string>;
    visibility: {
      title: string;
      description: string;
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
            {activeStep === "visibility" && (
              <SectionVisibilityToggles
                labels={labels.visibility}
                displaySettings={displaySettings}
                onDisplaySettingsChange={onDisplaySettingsChange}
                templateId={templateId}
                onTemplateSelect={onTemplateSelect}
              />
            )}
            {activeStep === "basics" && <BasicsForm labels={labels.basics} />}
            {activeStep === "summary" && (
              <SummaryForm
                label={labels.summary.label}
                placeholder={labels.summary.placeholder}
              />
            )}
            {activeStep === "experience" && <ExperienceForm labels={labels.experience} />}
            {activeStep === "education" && <EducationForm labels={labels.education} />}
            {activeStep === "skills" && <SkillsForm labels={labels.skills} />}
            {activeStep === "languages" && <LanguagesForm labels={labels.languages} />}
            {activeStep === "extras" && (
              <ExtrasForm labels={labels.extras} categoryNames={labels.extrasCategories} />
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
