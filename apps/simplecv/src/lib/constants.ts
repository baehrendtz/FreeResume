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

/** Maximum PDF file size in bytes (10 MB) */
export const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum number of PDF pages to process */
export const MAX_PDF_PAGES = 20;

// --- Zoom ranges ---
export const PREVIEW_ZOOM = { min: 0.5, max: 3.0, step: 0.25 } as const;

/** Zoom level for onboarding success preview */
export const ONBOARDING_PREVIEW_ZOOM = 0.403;

/** Debounce delay for form updates in ms */
export const FORM_DEBOUNCE_MS = 150;

/** Confirmation button timeout in ms */
export const CONFIRMATION_TIMEOUT_MS = 3000;

// --- Firestore sync ---

/** Debounce delay before saving CV to Firestore in ms */
export const FIRESTORE_SAVE_DEBOUNCE_MS = 3000;

/** Max Firestore document size in bytes (leave margin below the 1 MiB limit) */
export const FIRESTORE_MAX_DOC_BYTES = 900_000;
