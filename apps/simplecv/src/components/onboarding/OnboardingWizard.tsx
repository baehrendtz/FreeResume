"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfUploader } from "@/components/PdfUploader";
import { LinkedInGuide } from "./LinkedInGuide";
import { OnboardingSuccess } from "./OnboardingSuccess";
import { trackOnboardingStep, trackOnboardingComplete, trackOnboardingSkip } from "@/lib/analytics/gtag";
import type { CvModel } from "@/lib/model/CvModel";

type OnboardingStep = "welcome" | "guide" | "upload" | "success";

interface OnboardingWizardProps {
  labels: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    valuePropImport: string;
    valuePropTemplates: string;
    valuePropPdf: string;
    getStarted: string;
    skipLink: string;
    guideTitle: string;
    guideStep1: string;
    guideStep2: string;
    guideStep3: string;
    guideNext: string;
    guideBack: string;
    guideSkip: string;
    uploadDropzone: string;
    uploadProcessing: string;
    uploadTitle: string;
    uploadBack: string;
    uploadScratch: string;
    successTitle: string;
    successScratchTitle: string;
    successScratchDescription: string;
    successCta: string;
    successExperience: string;
    successEducation: string;
    successSkills: string;
  };
  processing: boolean;
  cv: CvModel;
  isFromScratch: boolean;
  onFileSelected: (file: File) => void;
  onStartFromScratch: () => void;
  onComplete: () => void;
}

const VALUE_PROPS = [
  { icon: Upload, key: "valuePropImport" as const },
  { icon: FileText, key: "valuePropTemplates" as const },
  { icon: Download, key: "valuePropPdf" as const },
] as const;

export function OnboardingWizard({
  labels,
  processing,
  cv,
  isFromScratch,
  onFileSelected,
  onStartFromScratch,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");

  // Auto-advance to success when PDF processing finishes
  const wasProcessing = useRef(false);
  useEffect(() => {
    if (wasProcessing.current && !processing && step === "upload") {
      setStep("success");
      trackOnboardingStep("success");
    }
    wasProcessing.current = processing;
  }, [processing, step]);

  const goTo = useCallback((next: OnboardingStep) => {
    setStep(next);
    trackOnboardingStep(next);
  }, []);

  const handleSkip = useCallback(() => {
    trackOnboardingSkip(step);
    onStartFromScratch();
    setStep("success");
    trackOnboardingStep("success");
  }, [step, onStartFromScratch]);

  const handleComplete = useCallback(() => {
    trackOnboardingComplete(isFromScratch ? "scratch" : "upload");
    onComplete();
  }, [isFromScratch, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8 py-8">
        {/* Logo */}
        <img src="/logo.png" alt="Free Resume" className="h-10 w-auto" />

        {step === "welcome" && (
          <div className="flex flex-col items-center gap-8 text-center w-full">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">{labels.welcomeTitle}</h1>
              <p className="text-muted-foreground">{labels.welcomeSubtitle}</p>
            </div>

            <div className="grid gap-3 w-full max-w-sm">
              {VALUE_PROPS.map(({ icon: Icon, key }) => (
                <div key={key} className="flex items-center gap-3 rounded-lg border p-3 text-left">
                  <div className="rounded-full bg-blue-50 dark:bg-blue-950/30 p-2 shrink-0">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm">{labels[key]}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button size="lg" onClick={() => goTo("guide")}>
                {labels.getStarted}
              </Button>
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {labels.skipLink}
              </button>
            </div>
          </div>
        )}

        {step === "guide" && (
          <div className="flex flex-col items-center gap-6 w-full">
            <LinkedInGuide labels={labels} />
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => goTo("welcome")}>
                {labels.guideBack}
              </Button>
              <Button onClick={() => goTo("upload")}>
                {labels.guideNext}
              </Button>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              {labels.guideSkip}
            </button>
          </div>
        )}

        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 w-full">
            <PdfUploader
              onFileSelected={onFileSelected}
              processing={processing}
              uploadLabel={labels.uploadTitle}
              dropzoneLabel={labels.uploadDropzone}
              processingLabel={labels.uploadProcessing}
            />
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => goTo("guide")} disabled={processing}>
                {labels.uploadBack}
              </Button>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              disabled={processing}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
            >
              {labels.uploadScratch}
            </button>
          </div>
        )}

        {step === "success" && (
          <OnboardingSuccess
            cv={cv}
            isFromScratch={isFromScratch}
            labels={labels}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
