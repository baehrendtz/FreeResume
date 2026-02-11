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
  },
} as const;

export type CvLanguage = keyof typeof cvStrings;
export type CvStrings = (typeof cvStrings)[CvLanguage];

export function getCvStrings(lang: CvLanguage): CvStrings {
  return cvStrings[lang];
}

// ---------------------------------------------------------------------------
// Language catalog (ISO 639-1 codes → display names in en/sv)
// ---------------------------------------------------------------------------

export interface LanguageCatalogEntry {
  id: string;
  en: string;
  sv: string;
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
