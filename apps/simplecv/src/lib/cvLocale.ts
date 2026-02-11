const cvStrings = {
  en: {
    summary: "Summary",
    experience: "Experience",
    professionalExperience: "Professional Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    extras: "Extras",
    contact: "Contact",
    native: "Native or Bilingual",
    full_professional: "Full Professional",
    professional_working: "Professional Working",
    limited_working: "Limited Working",
    elementary: "Elementary",
    yourName: "Your Name",
  },
  sv: {
    summary: "Sammanfattning",
    experience: "Erfarenhet",
    professionalExperience: "Yrkeserfarenhet",
    education: "Utbildning",
    skills: "Kompetenser",
    languages: "Språk",
    extras: "Övrigt",
    contact: "Kontakt",
    native: "Modersmål",
    full_professional: "Flytande",
    professional_working: "Goda kunskaper",
    limited_working: "Grundläggande",
    elementary: "Nybörjare",
    yourName: "Ditt namn",
  },
} as const;

export type CvLanguage = keyof typeof cvStrings;
export type CvStrings = (typeof cvStrings)[CvLanguage];
export type LocaleMap = Record<CvLanguage, string>;

export function getCvStrings(lang: CvLanguage): CvStrings {
  return cvStrings[lang];
}

// ---------------------------------------------------------------------------
// Language catalog (ISO 639-1 codes → display names in en/sv)
// ---------------------------------------------------------------------------

export interface LanguageCatalogEntry extends LocaleMap {
  id: string;
}

export const LANGUAGE_CATALOG: LanguageCatalogEntry[] = [
  { id: "en", en: "English", sv: "Engelska" },
  { id: "sv", en: "Swedish", sv: "Svenska" },
  { id: "es", en: "Spanish", sv: "Spanska" },
  { id: "zh", en: "Chinese", sv: "Kinesiska" },
  { id: "hi", en: "Hindi", sv: "Hindi" },
  { id: "ar", en: "Arabic", sv: "Arabiska" },
  { id: "fr", en: "French", sv: "Franska" },
  { id: "pt", en: "Portuguese", sv: "Portugisiska" },
  { id: "de", en: "German", sv: "Tyska" },
  { id: "ja", en: "Japanese", sv: "Japanska" },
  { id: "ko", en: "Korean", sv: "Koreanska" },
  { id: "it", en: "Italian", sv: "Italienska" },
  { id: "ru", en: "Russian", sv: "Ryska" },
  { id: "nl", en: "Dutch", sv: "Nederländska" },
  { id: "pl", en: "Polish", sv: "Polska" },
  { id: "da", en: "Danish", sv: "Danska" },
  { id: "no", en: "Norwegian", sv: "Norska" },
  { id: "fi", en: "Finnish", sv: "Finska" },
  { id: "tr", en: "Turkish", sv: "Turkiska" },
  { id: "uk", en: "Ukrainian", sv: "Ukrainska" },
];

const catalogById = new Map<string, LanguageCatalogEntry>(
  LANGUAGE_CATALOG.map((e) => [e.id, e]),
);

const catalogByName = new Map<string, LanguageCatalogEntry>(
  LANGUAGE_CATALOG.flatMap((e) => [
    [e.en.toLowerCase(), e],
    [e.sv.toLowerCase(), e],
  ]),
);

/** Resolve a stored name/ID to a display name for the CV output (based on cvLanguage). */
export function resolveLanguageName(nameOrId: string, cvLanguage: CvLanguage): string {
  const byId = catalogById.get(nameOrId);
  if (byId) return byId[cvLanguage];
  const byName = catalogByName.get(nameOrId.toLowerCase());
  if (byName) return byName[cvLanguage];
  return nameOrId;
}

/** Find a catalog ID from a display name. Case-insensitive. Returns undefined if not found. */
export function findLanguageId(displayName: string): string | undefined {
  const entry = catalogByName.get(displayName.toLowerCase());
  return entry?.id;
}

/** Resolve a stored name/ID to a display name for the editor UI (based on app locale). */
export function resolveLanguageDisplayName(nameOrId: string, uiLocale: string): string {
  const lang = uiLocale === "sv" ? "sv" : "en";
  const byId = catalogById.get(nameOrId);
  if (byId) return byId[lang];
  const byName = catalogByName.get(nameOrId.toLowerCase());
  if (byName) return byName[lang];
  return nameOrId;
}

// ---------------------------------------------------------------------------
// Date formatting (locale-aware)
// ---------------------------------------------------------------------------

export const MONTH_LOOKUP: Record<string, number> = {
  // English
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  // Swedish (those that differ)
  januari: 1, februari: 2, mars: 3, maj: 5, juni: 6,
  juli: 7, augusti: 8, oktober: 10, okt: 10,
};

const MONTH_ABBR: Record<number, LocaleMap> = {
  1:  { en: "Jan", sv: "Jan" },
  2:  { en: "Feb", sv: "Feb" },
  3:  { en: "Mar", sv: "Mar" },
  4:  { en: "Apr", sv: "Apr" },
  5:  { en: "May", sv: "Maj" },
  6:  { en: "Jun", sv: "Jun" },
  7:  { en: "Jul", sv: "Jul" },
  8:  { en: "Aug", sv: "Aug" },
  9:  { en: "Sep", sv: "Sep" },
  10: { en: "Oct", sv: "Okt" },
  11: { en: "Nov", sv: "Nov" },
  12: { en: "Dec", sv: "Dec" },
};

const PRESENT_TOKENS = new Set(["present", "nu", "pågående", "pagaende", "current"]);

/**
 * Format a raw date string according to cvLanguage.
 * - "present"/"nu"/"pågående"/"current" → "Present" (en) / "Pågående" (sv)
 * - "2020" (year only) → passed through
 * - "Oktober 2020" / "October 2020" → "Okt 2020" (sv) / "Oct 2020" (en)
 * - Unknown format → passed through
 */
export function formatCvDate(raw: string, cvLanguage: CvLanguage): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  if (PRESENT_TOKENS.has(trimmed.toLowerCase())) {
    return cvLanguage === "sv" ? "Pågående" : "Present";
  }

  // Year only
  if (/^\d{4}$/.test(trimmed)) return trimmed;

  // "Month Year" pattern
  const match = trimmed.match(/^([A-Za-zÀ-ÖØ-öø-ÿ]+)\s+(\d{4})$/);
  if (match) {
    const monthNum = MONTH_LOOKUP[match[1].toLowerCase()];
    if (monthNum) {
      return `${MONTH_ABBR[monthNum][cvLanguage]} ${match[2]}`;
    }
  }

  return trimmed;
}

// ---------------------------------------------------------------------------
// Extras category translation
// ---------------------------------------------------------------------------

const EXTRAS_CATEGORY_LABELS: Record<string, LocaleMap> = {
  certifications: { en: "Certifications", sv: "Certifieringar" },
  honors:         { en: "Honors & Awards", sv: "Utmärkelser" },
  publications:   { en: "Publications", sv: "Publikationer" },
  volunteering:   { en: "Volunteering", sv: "Ideellt arbete" },
  organizations:  { en: "Organizations", sv: "Organisationer" },
  courses:        { en: "Courses", sv: "Kurser" },
  projects:       { en: "Projects", sv: "Projekt" },
  patents:        { en: "Patents", sv: "Patent" },
  other:          { en: "Other", sv: "Övrigt" },
};

/** Translate an extras category key to a display label for the given cvLanguage. */
export function translateExtrasCategory(category: string, cvLanguage: CvLanguage): string {
  const normalized = category.toLowerCase().replace(/-/g, " ").trim();
  const entry = EXTRAS_CATEGORY_LABELS[normalized];
  if (entry) return entry[cvLanguage];
  // Fallback: capitalize first letter
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
}
