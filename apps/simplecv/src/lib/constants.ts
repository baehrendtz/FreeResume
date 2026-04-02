// ---------------------------------------------------------------------------
// Shared constants — values used in 2+ locations or non-obvious computations
// ---------------------------------------------------------------------------

/** A4 page dimensions in px at 96 DPI */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const MAX_PHOTO_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_FIT_ITERATIONS = 20;
export const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_PDF_PAGES = 20;

// --- Style stepper ranges (used by UI + validation) ---
export const FONT_SIZE_RANGE = { min: 80, max: 120, step: 5 } as const;
export const PHOTO_SIZE_RANGE = { min: 48, max: 144, step: 16 } as const;
export const LINE_HEIGHT_RANGE = { min: 80, max: 120, step: 5 } as const;
export const PREVIEW_ZOOM = { min: 0.5, max: 3.0, step: 0.25 } as const;

export const FORM_DEBOUNCE_MS = 150;
export const CONFIRMATION_TIMEOUT_MS = 3000;
