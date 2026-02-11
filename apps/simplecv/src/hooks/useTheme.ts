"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

function getThemeCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match('(^|; )theme=([^;]*)');
  return m ? m[2] : null;
}

function setThemeCookie(v: string) {
  document.cookie = `theme=${v};domain=.freeresume.eu;path=/;max-age=31536000;SameSite=Lax`;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") || getThemeCookie();
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
