"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Upload,
  FileDown,
  MoreVertical,
  Sun,
  Moon,
  CircleHelp,
} from "lucide-react";
import { HelpDialog } from "@/components/HelpDialog";
import { trackThemeToggle, trackHelpOpened } from "@/lib/analytics/gtag";

interface HelpLabels {
  title: string;
  intro: string;
  howItWorksTitle: string;
  step1: string;
  step2: string;
  step3: string;
  downloadTitle: string;
  downloadText: string;
  dataTitle: string;
  dataText: string;
  footer: string;
}

interface AppHeaderProps {
  title: string;
  locale: string;
  onImportPdf: () => void;
  onDownloadPdf: () => void;
  downloading: boolean;
  labels: {
    importPdf: string;
    downloadPdf: string;
    generating: string;
    moreActions: string;
    themeToggle: string;
    help: string;
  };
  helpLabels: HelpLabels;
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function AppHeader({
  title,
  locale,
  onImportPdf,
  onDownloadPdf,
  downloading,
  labels,
  helpLabels,
}: AppHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    trackThemeToggle(next);
  };

  return (
    <header className="print:hidden border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <img src="/logo.png" alt={title} className="h-9 w-auto" />

        {/* Desktop actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onImportPdf}
            className="hidden md:inline-flex"
          >
            <Upload className="h-4 w-4 mr-1" />
            {labels.importPdf}
          </Button>
          <Button
            size="sm"
            onClick={onDownloadPdf}
            disabled={downloading}
            className="hidden md:inline-flex"
          >
            <FileDown className="h-4 w-4 mr-1" />
            {downloading ? labels.generating : labels.downloadPdf}
          </Button>

          <LanguageSwitcher locale={locale} />

          {/* Desktop help button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden md:inline-flex"
            onClick={() => { setShowHelp(true); trackHelpOpened(); }}
            aria-label={labels.help}
          >
            <CircleHelp className="h-4 w-4" />
          </Button>

          {/* Desktop theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden md:inline-flex"
              onClick={toggleTheme}
              aria-label={labels.themeToggle}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                aria-label={labels.moreActions}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onImportPdf}>
                <Upload className="h-4 w-4" />
                {labels.importPdf}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDownloadPdf} disabled={downloading}>
                <FileDown className="h-4 w-4" />
                {downloading ? labels.generating : labels.downloadPdf}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {mounted && (
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {labels.themeToggle}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setShowHelp(true); trackHelpOpened(); }}>
                <CircleHelp className="h-4 w-4" />
                {labels.help}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <HelpDialog open={showHelp} onOpenChange={setShowHelp} labels={helpLabels} />
    </header>
  );
}
