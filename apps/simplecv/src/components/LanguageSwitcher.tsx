"use client";

import { useId } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trackLanguageSwitch } from "@/lib/analytics/gtag";

interface LanguageSwitcherProps {
  locale: string;
}

function SwedishFlag() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 10" className="w-5 h-auto rounded-sm" aria-hidden="true">
      <rect width="16" height="10" fill="#006AA7" />
      <rect x="5" width="2" height="10" fill="#FECC00" />
      <rect y="4" width="16" height="2" fill="#FECC00" />
    </svg>
  );
}

function BritishFlag({ clipId }: { clipId: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-auto rounded-sm" aria-hidden="true">
      <clipPath id={clipId}><rect width="60" height="30" /></clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
        <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath={`url(#${clipId})`} style={{ clipRule: "evenodd" }} />
        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
        <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const clipId = useId();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "sv" ? "en" : "sv";
    trackLanguageSwitch(newLocale);
    const newPath = pathname.replace(new RegExp(`^/${locale}\\b`), `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      aria-label={locale === "sv" ? "Switch to English" : "Byt till svenska"}
    >
      {locale === "sv" ? <BritishFlag clipId={clipId} /> : <SwedishFlag />}
    </button>
  );
}
