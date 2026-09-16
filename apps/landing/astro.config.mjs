import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://freeresume.eu',
  integrations: [
    tailwind(),
    // Language alternates in the sitemap tell Google that /sv and /en are the same page
    sitemap({
      i18n: {
        defaultLocale: 'sv',
        locales: { sv: 'sv-SE', en: 'en' },
      },
      lastmod: new Date(),
    }),
  ],
  i18n: {
    defaultLocale: 'sv',
    locales: ['sv', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
