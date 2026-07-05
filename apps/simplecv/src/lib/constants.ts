// ---------------------------------------------------------------------------
// Shared constants, values used in 2+ locations or non-obvious computations
// ---------------------------------------------------------------------------

/** A4 page dimensions in px at 96 DPI */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const MAX_PHOTO_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_FIT_ITERATIONS = 20;
export const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_PDF_PAGES = 20;

// --- Content limit stepper ranges (Settings > Content Limits) ---
export const CONTENT_LIMIT_RANGES = {
  maxExperience: { min: 1, max: 50, step: 1 },
  maxEducation: { min: 1, max: 10, step: 1 },
  maxSkills: { min: 1, max: 30, step: 1 },
  maxBulletsPerJob: { min: 0, max: 10, step: 1 },
  summaryMaxChars: { min: 50, max: 1000, step: 50 },
  maxExtras: { min: 1, max: 20, step: 1 },
} as const;

// --- Style stepper ranges (used by UI + validation) ---
export const FONT_SIZE_RANGE = { min: 80, max: 120, step: 5 } as const;
export const PHOTO_SIZE_RANGE = { min: 48, max: 144, step: 16 } as const;
export const LINE_HEIGHT_RANGE = { min: 80, max: 120, step: 5 } as const;
export const PREVIEW_ZOOM = { min: 0.25, max: 3.0, step: 0.25 } as const;

export const FORM_DEBOUNCE_MS = 150;
export const CONFIRMATION_TIMEOUT_MS = 3000;
export const DUPLICATE_WARNING_TIMEOUT_MS = 2000;
export const ONBOARDING_PREVIEW_DELAY_MS = 800;

/** Longest side of an uploaded photo after downscaling (px). Keeps base64
 *  payloads small enough to fit sessionStorage alongside the rest of the CV. */
export const MAX_PHOTO_DIMENSION_PX = 512;
