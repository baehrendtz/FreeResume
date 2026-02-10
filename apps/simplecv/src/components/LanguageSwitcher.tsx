"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { trackLanguageSwitch } from "@/lib/analytics/gtag";

const LOCALES = ["en", "sv"] as const;
const LABELS: Record<string, string> = { en: "EN", sv: "SV" };

interface LanguageSwitcherProps {
  locale: string;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    trackLanguageSwitch(newLocale);
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center rounded-full bg-muted p-0.5">
      {LOCALES.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={cn(
            "px-2.5 py-0.5 text-xs font-medium rounded-full transition-all",
            loc === locale
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LABELS[loc]}
        </button>
      ))}
    </div>
  );
}
