"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, ExternalLink, FileText, FolderOpen, Loader2, Smartphone, Sparkles, Upload } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CvPreview } from "@/components/CvPreview";
import { LinkedInSaveMock } from "./LinkedInSaveMock";
import { usePdfDrop } from "@/hooks/usePdfDrop";
import { useWindowFileDrop } from "@/hooks/useWindowFileDrop";
import type { ImportError, ImportPhase } from "@/hooks/usePdfImport";
import { buildRenderModel } from "@/lib/fitting";
import { defaultDisplaySettings } from "@/lib/model/DisplaySettings";
import { getTemplateMeta, getTemplateDefaultStyle } from "@/templates/templateRegistry";
import { createSampleCv, SAMPLE_TEMPLATE_ID } from "@/lib/sampleCv";
import { cn } from "@/lib/utils";

/** LinkedIn redirects this to the signed-in member's own profile. */
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/me/";

interface StepProps {
  number: number;
  title: string;
  hint?: string;
  isLast?: boolean;
  children: ReactNode;
}

function Step({ number, title, hint, isLast = false, children }: StepProps) {
  return (
    <li className={cn("relative flex gap-4", !isLast && "pb-7")}>
      {!isLast && <span aria-hidden className="absolute left-4 top-10 bottom-2 w-px bg-border" />}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {number}
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="font-semibold leading-snug">{title}</h3>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
        <div className="mt-2.5">{children}</div>
      </div>
    </li>
  );
}

function PhaseRow({ label, state }: { label: string; state: "pending" | "active" | "done" }) {
  return (
    <li className={cn("flex items-center gap-2", state === "pending" && "text-muted-foreground")}>
      {state === "done" && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
      {state === "active" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      {state === "pending" && <span className="h-4 w-4 rounded-full border" />}
      {label}
    </li>
  );
}

interface StartScreenProps {
  processing: boolean;
  phase: ImportPhase | null;
  error: ImportError | null;
  onFileSelected: (file: File) => void;
  onStartFromScratch: () => void;
  onTryExample: () => void;
}

/**
 * First screen. The upload comes first, since most visitors either already have
 * the PDF or want to start right away. The LinkedIn guide sits below for the rest.
 */
export function StartScreen({ processing, phase, error, onFileSelected, onStartFromScratch, onTryExample }: StartScreenProps) {
  const t = useTranslations("start");
  const tUpload = useTranslations("upload");
  const locale = useLocale();
  const [openedLinkedIn, setOpenedLinkedIn] = useState(false);
  const [returned, setReturned] = useState(false);

  const { inputRef, handleChange, handleFile, error: fileTypeError } = usePdfDrop({
    onFileSelected,
    invalidFileTypeMessage: tUpload("invalidFileType"),
  });
  const isDragging = useWindowFileDrop(handleFile, !processing);

  // Coming back from the LinkedIn tab is the moment to point at the upload area
  useEffect(() => {
    if (!openedLinkedIn) return;
    const handleFocus = () => setReturned(true);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [openedLinkedIn]);

  const sample = useMemo(() => {
    const cvLanguage = locale === "sv" ? "sv" : "en";
    return {
      renderModel: buildRenderModel(createSampleCv(locale), getTemplateMeta(SAMPLE_TEMPLATE_ID), {
        ...defaultDisplaySettings,
        cvLanguage,
      }),
      styleSettings: getTemplateDefaultStyle(SAMPLE_TEMPLATE_ID),
    };
  }, [locale]);

  const errorMessage =
    error === "cv_file_invalid" ? tUpload("fileError") : error ? t("pdfError") : fileTypeError;

  const openFilePicker = () => {
    if (!processing) inputRef.current?.click();
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:py-10">
      <div className="min-w-0">
        <h1 className="max-w-xl text-3xl font-bold tracking-tight text-balance sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">{t("trust")}</p>

        <p className="mt-6 flex items-start gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground md:hidden">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
          {t("mobileNotice")}
        </p>

        <div className="mt-8">
          <div
            role="button"
            tabIndex={processing ? -1 : 0}
            aria-label={t("dropButton")}
            aria-describedby="drop-hint"
            aria-disabled={processing}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            className={cn(
              "flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-6 text-center transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              processing
                ? "cursor-default border-border"
                : isDragging || returned
                  ? "cursor-pointer border-primary bg-primary/5"
                  : errorMessage
                    ? "cursor-pointer border-destructive/50 bg-destructive/5"
                    : "cursor-pointer border-border hover:border-primary/60 hover:bg-muted/50",
            )}
          >
            {processing ? (
              <ul className="space-y-2 text-left text-sm" aria-live="polite">
                <PhaseRow label={t("reading")} state={phase === "parsing" ? "done" : "active"} />
                <PhaseRow label={t("parsing")} state={phase === "parsing" ? "active" : "pending"} />
              </ul>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold">
                    {returned ? (
                      t("welcomeBack")
                    ) : (
                      <>
                        <span className="pointer-coarse:hidden">{t("dropTitle")}</span>
                        <span className="hidden pointer-coarse:inline">{t("dropTitleTouch")}</span>
                      </>
                    )}
                  </p>
                  <p id="drop-hint" className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    {t("dropHint")}
                  </p>
                </div>
                <span className={buttonVariants({ size: "sm" })}>{t("dropButton")}</span>
              </>
            )}
          </div>
          {errorMessage && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span className="text-muted-foreground">{t("noPdf")}</span>
            <Button variant="outline" size="sm" onClick={onStartFromScratch} disabled={processing}>
              <FileText className="h-4 w-4" />
              {t("scratch")}
            </Button>
            <Button variant="outline" size="sm" onClick={onTryExample} disabled={processing}>
              <Sparkles className="h-4 w-4" />
              {t("example")}
            </Button>
          </div>
        </div>

        <section className="mt-10 border-t pt-8">
          <h2 className="text-lg font-semibold">{t("howToTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("howToHint")}</p>
          <ol className="mt-6">
            <Step number={1} title={t("step1Title")}>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={LINKEDIN_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpenedLinkedIn(true)}
                >
                  {t("step1Action")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </Step>

            <Step number={2} title={t("step2Title")} hint={t("step2Hint")} isLast>
              <LinkedInSaveMock
                labels={{
                  openTo: t("mock.openTo"),
                  addSection: t("mock.addSection"),
                  resources: t("mock.resources"),
                  sendProfile: t("mock.sendProfile"),
                  savePdf: t("mock.savePdf"),
                }}
              />
              <details className="group mt-2.5 max-w-sm text-sm">
                <summary className="flex cursor-pointer list-none items-center gap-1 font-medium text-primary [&::-webkit-details-marker]:hidden">
                  {t("troubleTitle")}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>{t("trouble1")}</li>
                  <li>{t("trouble2")}</li>
                  <li>{t("trouble3")}</li>
                  <li>{t("trouble4")}</li>
                </ul>
              </details>
            </Step>
          </ol>
        </section>

        <div className="mt-8 border-t pt-5 text-sm">
          <Button variant="link" className="h-auto p-0" onClick={openFilePicker} disabled={processing}>
            <FolderOpen className="h-4 w-4" />
            {t("openSaved")}
          </Button>
        </div>

        <input ref={inputRef} type="file" accept=".pdf,.json" className="hidden" onChange={handleChange} />
      </div>

      <figure className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="rounded-2xl bg-desk p-6">
          <div aria-hidden className="pointer-events-none">
            <CvPreview renderModel={sample.renderModel} templateId={SAMPLE_TEMPLATE_ID} styleSettings={sample.styleSettings} />
          </div>
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">{t("sampleCaption")}</figcaption>
      </figure>

      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
          <div className="rounded-2xl border-2 border-dashed border-primary bg-background px-10 py-8 text-center shadow-lg">
            <Upload className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-lg font-semibold">{t("dropOverlay")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
