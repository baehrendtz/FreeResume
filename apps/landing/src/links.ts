import type { Lang } from './types';

/** The app opens in the visitor's own language, so Swedes never land on the English version. */
export function appUrl(lang: Lang): string {
  return `https://app.freeresume.eu/${lang}`;
}

/** Page paths per language, used for navigation, hreflang and internal links. */
export const paths = {
  sv: {
    home: '/',
    guide: '/spara-linkedin-som-pdf/',
    templates: '/cv-mallar/',
  },
  en: {
    home: '/en/',
    guide: '/en/save-linkedin-as-pdf/',
    templates: '/en/cv-templates/',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export const githubUrl = 'https://github.com/baehrendtz/FreeResume';
