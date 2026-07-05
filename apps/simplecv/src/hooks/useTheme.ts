"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/useMounted";


function getThemeCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match('(^|; )theme=([^;]*)');
  return m ? m[2] : null;
}

function setThemeCookie(v: string) {
  // The domain attribute is only valid on the production domain, a mismatched
  // domain makes the browser silently reject the cookie (e.g. on localhost).
  const domain = location.hostname.endsWith("freeresume.eu") ? ";domain=.freeresume.eu" : "";
  document.cookie = `theme=${v}${domain};path=/;max-age=31536000;SameSite=Lax`; // 1 year
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") || getThemeCookie();
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    setThemeCookie(theme);
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}
