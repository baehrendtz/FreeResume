import { BRAND } from "@freeresume/shared/brand";

export const GA_MEASUREMENT_ID = BRAND.ga.measurementId;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtagEvent(eventName: string, params?: Record<string, string | boolean>) {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", eventName, params);
  } catch {
    // Silently ignore — GA may be blocked by ad blockers
  }
}

// --- Typed event functions ---

export function trackPdfUpload(result: "success" | "failure") {
  gtagEvent("pdf_upload", { result });
}

export function trackPdfDownload(templateId: string) {
  gtagEvent("pdf_download", { template_id: templateId });
}

export function trackTemplateSwitch(templateId: string) {
  gtagEvent("template_switch", { template_id: templateId });
}

export function trackStartFromScratch() {
  gtagEvent("start_from_scratch");
}

export function trackAutoFit() {
  gtagEvent("auto_fit");
}

export function trackFullscreenPreview() {
  gtagEvent("fullscreen_preview");
}

export function trackWizardStep(stepId: string) {
  gtagEvent("wizard_step", { step_id: stepId });
}

export function trackSectionToggle(section: string, visible: boolean) {
  gtagEvent("section_toggle", { section, visible });
}

export function trackPhotoUpload() {
  gtagEvent("photo_upload");
}

export function trackLanguageSwitch(locale: string) {
  gtagEvent("language_switch", { locale });
}

export function trackThemeToggle(theme: string) {
  gtagEvent("theme_toggle", { theme });
}

export function trackHelpOpened() {
  gtagEvent("help_opened");
}

export function trackExperienceAdd() {
  gtagEvent("experience_add");
}

export function trackExperienceRemove() {
  gtagEvent("experience_remove");
}

export function trackEducationAdd() {
  gtagEvent("education_add");
}

export function trackEducationRemove() {
  gtagEvent("education_remove");
}

export function trackSkillAdd() {
  gtagEvent("skill_add");
}

export function trackSkillRemove() {
  gtagEvent("skill_remove");
}

export function trackOnboardingStep(step: string) {
  gtagEvent("onboarding_step", { step });
}

export function trackOnboardingComplete(method: "upload" | "scratch") {
  gtagEvent("onboarding_complete", { method });
}

export function trackOnboardingSkip(fromStep: string) {
  gtagEvent("onboarding_skip", { from_step: fromStep });
}
