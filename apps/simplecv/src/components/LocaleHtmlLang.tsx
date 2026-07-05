"use client";

import { useEffect } from "react";

/**
 * Keeps <html lang> in sync with the active locale. The root layout is
 * outside the [locale] segment, so it can't set this statically.
 */
export function LocaleHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
