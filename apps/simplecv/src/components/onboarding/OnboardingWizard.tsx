"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { LinkedInGuide } from "./LinkedInGuide";
import { OnboardingSuccess } from "./OnboardingSuccess";
import { trackOnboardingStep, trackOnboardingComplete, trackOnboardingSkip } from "@/lib/analytics/gtag";
import type { CvModel } from "@/lib/model/CvModel";

type OnboardingStep = "choose" | "success";

interface OnboardingWizardProps {
  labels: {
    chooseTitle: string;
    chooseSubtitle: string;
    importTitle: string;
    importDescription: string;
    scratchTitle: string;
    scratchDescription: string;
    howToGetPdf: string;
    guideTitle: string;
    guideStep1: string;
    guideStep2: string;
    guideStep3: string;
    uploadDropzone: string;
    uploadProcessing: string;
    uploadTitle: string;
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

export function OnboardingWizard({
  labels,
  processing,
  cv,
  isFromScratch,
  onFileSelected,
  onStartFromScratch,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<OnboardingStep>("choose");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-advance to success when PDF processing finishes
  const wasProcessing = useRef(false);
  useEffect(() => {
    if (wasProcessing.current && !processing && step === "choose") {
      setStep("success");
      trackOnboardingStep("success");
    }
    wasProcessing.current = processing;
  }, [processing, step]);

  const handleFile = useCallback(
    (file: File) => {
      if (file.type === "application/pdf") {
        onFileSelected(file);
      }
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleScratch = useCallback(() => {
    trackOnboardingSkip("choose");
    onStartFromScratch();
    setStep("success");
    trackOnboardingStep("success");
  }, [onStartFromScratch]);

  const handleComplete = useCallback(() => {
    trackOnboardingComplete(isFromScratch ? "scratch" : "upload");
    onComplete();
  }, [isFromScratch, onComplete]);

  const stepIndex = step === "choose" ? 0 : 1;

  return (
    <div className="flex flex-col items-center gap-8 py-12 px-4 w-full max-w-3xl mx-auto">
      {step === "choose" && (
        <>
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {labels.chooseTitle}
            </h1>
            <p className="text-muted-foreground">{labels.chooseSubtitle}</p>
          </div>

          {/* Two option cards side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Left: Import from LinkedIn */}
            <div className="flex flex-col rounded-xl border bg-card">
              <div
                className={`flex-1 flex flex-col items-center justify-center gap-4 p-6 border-b border-dashed cursor-pointer transition-all duration-200 rounded-t-xl ${
                  dragOver
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : "border-border hover:border-blue-400 hover:bg-muted/30"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !processing && inputRef.current?.click()}
              >
                <div className={`rounded-full p-3 transition-colors ${
                  dragOver ? "bg-blue-100 dark:bg-blue-900/30" : "bg-blue-50 dark:bg-blue-950/30"
                }`}>
                  {processing ? (
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  ) : (
                    <Upload className={`h-8 w-8 transition-colors ${
                      dragOver ? "text-blue-500" : "text-blue-600 dark:text-blue-400"
                    }`} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold">{labels.importTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {processing ? labels.uploadProcessing : labels.importDescription}
                  </p>
                </div>
                {!processing && (
                  <span className="text-xs text-muted-foreground">{labels.uploadDropzone}</span>
                )}
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {/* Collapsible LinkedIn guide */}
              <div className="p-3">
                <LinkedInGuide
                  labels={{
                    guideTitle: labels.guideTitle,
                    guideStep1: labels.guideStep1,
                    guideStep2: labels.guideStep2,
                    guideStep3: labels.guideStep3,
                    howToGetPdf: labels.howToGetPdf,
                  }}
                />
              </div>
            </div>

            {/* Right: Start from scratch */}
            <button
              type="button"
              onClick={handleScratch}
              disabled={processing}
              className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl border bg-card hover:border-foreground/20 hover:bg-muted/30 transition-all duration-200 disabled:opacity-50 cursor-pointer text-center"
            >
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">{labels.scratchTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">{labels.scratchDescription}</p>
              </div>
            </button>
          </div>
        </>
      )}

      {step === "success" && (
        <OnboardingSuccess
          cv={cv}
          isFromScratch={isFromScratch}
          labels={labels}
          onComplete={handleComplete}
        />
      )}

      {/* Step indicator dots */}
      <div className="flex items-center gap-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === stepIndex
                ? "w-6 bg-blue-600 dark:bg-blue-400"
                : "w-2 bg-muted-foreground/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
