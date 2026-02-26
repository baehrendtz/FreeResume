// ---------------------------------------------------------------------------
// Shared constants — single source of truth for magic numbers used across the app
// ---------------------------------------------------------------------------

/** Full-width of an A4 page in px at 96 DPI */
export const A4_WIDTH_PX = 794;

/** Full-height of an A4 page in px at 96 DPI */
export const A4_HEIGHT_PX = 1123;

/** Maximum photo file size in bytes (2 MB) */
export const MAX_PHOTO_FILE_SIZE = 2 * 1024 * 1024;

/** Maximum iterations for the auto-fit algorithm */
export const MAX_FIT_ITERATIONS = 20;

/** Accepted MIME type for LinkedIn PDF uploads */
export const PDF_MIME_TYPE = "application/pdf";

// --- Style stepper ranges ---

export const FONT_SIZE_RANGE = { min: 80, max: 120, step: 5 } as const;
export const PHOTO_SIZE_RANGE = { min: 48, max: 144, step: 16 } as const;
export const LINE_HEIGHT_RANGE = { min: 80, max: 120, step: 5 } as const;
