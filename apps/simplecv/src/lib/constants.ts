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

/** Space kept above a wizard step when scrolling it into view below the sticky app header (px). */
export const STICKY_HEADER_OFFSET_PX = 72;

/** Longest side of an uploaded photo after downscaling (px). Keeps base64
 *  payloads small enough to fit sessionStorage alongside the rest of the CV. */
export const MAX_PHOTO_DIMENSION_PX = 512;

// --- PDF export ---
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
/** CSS px to PDF points (96 DPI to 72 DPI). */
export const PX_TO_PT = 0.75;
/** Longest wait for a lazily loaded template before PDF export gives up (ms). */
export const TEMPLATE_LOAD_TIMEOUT_MS = 10_000;
/** Words whose tops differ by less than this belong to the same text line (px). */
export const SAME_LINE_TOLERANCE_PX = 2;

// --- Editor ---
/** Headlines longer than this get a tip before download. */
export const HEADLINE_MAX_CHARS = 100;
/** Earliest year offered by the date pickers. */
export const YEAR_PICKER_MIN = 1950;

/** Quick-pick swatches for accent colors, dark enough to read as headings. */
export const ACCENT_COLOR_PRESETS = ["#0d9488", "#2563eb", "#1e3a5f", "#334155", "#15803d", "#9f1239", "#7c3aed", "#c2410c"] as const;
/** Quick-pick swatches for light sidebar backgrounds. */
export const SIDEBAR_COLOR_PRESETS = ["#f1f5f9", "#dce4ed", "#e0f2fe", "#ecfdf5", "#fef3c7", "#f5f3ff", "#fdf2f8", "#f8fafc"] as const;
