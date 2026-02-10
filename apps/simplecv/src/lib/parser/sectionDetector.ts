export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "contact"
  | "extras"
  | "unknown";

const SECTION_MAP: Record<string, SectionType> = {
  // English
  summary: "summary",
  about: "summary",
  "about me": "summary",
  profile: "summary",
  experience: "experience",
  "work experience": "experience",
  employment: "experience",
  education: "education",
  skills: "skills",
  "top skills": "skills",
  competencies: "skills",
  languages: "languages",
  contact: "contact",
  certifications: "extras",
  certificates: "extras",
  "licenses & certifications": "extras",
  "licenses and certifications": "extras",
  honors: "extras",
  awards: "extras",
  "honors-awards": "extras",
  "honors & awards": "extras",
  "honors and awards": "extras",
  publications: "extras",
  "volunteer experience": "extras",
  volunteering: "extras",
  organizations: "extras",
  courses: "extras",
  projects: "extras",
  patents: "extras",
  // Swedish
  sammanfattning: "summary",
  om: "summary",
  "om mig": "summary",
  profil: "summary",
  erfarenhet: "experience",
  arbetslivserfarenhet: "experience",
  anställning: "experience",
  utbildning: "education",
  kunskaper: "skills",
  kompetenser: "skills",
  "främsta kompetenser": "skills",
  färdigheter: "skills",
  språk: "languages",
  kontakta: "contact",
  kontakt: "contact",
  certifieringar: "extras",
  "licenser och certifieringar": "extras",
  "licenser & certifieringar": "extras",
  utmärkelser: "extras",
  publikationer: "extras",
  "ideellt arbete": "extras",
};

const EXTRAS_CATEGORY_MAP: Record<string, string> = {
  certifications: "certifications",
  certificates: "certifications",
  "licenses & certifications": "certifications",
  "licenses and certifications": "certifications",
  honors: "honors",
  awards: "honors",
  "honors-awards": "honors",
  "honors & awards": "honors",
  "honors and awards": "honors",
  publications: "publications",
  "volunteer experience": "volunteering",
  volunteering: "volunteering",
  organizations: "organizations",
  courses: "courses",
  projects: "projects",
  patents: "patents",
  // Swedish
  certifieringar: "certifications",
  "licenser och certifieringar": "certifications",
  "licenser & certifieringar": "certifications",
  utmärkelser: "honors",
  publikationer: "publications",
  "ideellt arbete": "volunteering",
};

export function detectExtrasCategory(text: string): string {
  const normalized = text.trim().toLowerCase();
  const exact = EXTRAS_CATEGORY_MAP[normalized];
  if (exact) return exact;
  if (/certif|licen/.test(normalized)) return "certifications";
  if (/honor|award|utmärk/.test(normalized)) return "honors";
  if (/publicat|publikat/.test(normalized)) return "publications";
  if (/volunt|ideell/.test(normalized)) return "volunteering";
  if (/course|kurs/.test(normalized)) return "courses";
  if (/project|projekt/.test(normalized)) return "projects";
  if (/patent/.test(normalized)) return "patents";
  if (/organiz/.test(normalized)) return "organizations";
  return "other";
}

export function detectSection(text: string): SectionType {
  const normalized = text.trim().toLowerCase();

  // 1. Exact match
  const exact = SECTION_MAP[normalized];
  if (exact) return exact;

  // 2. Keyword fallback for compound/variant section headers
  if (normalized.length < 40) {
    if (/certif|honor|award|publicat/.test(normalized)) return "extras";
  }

  return "unknown";
}
