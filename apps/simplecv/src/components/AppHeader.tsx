"use client";

import { useState } from "react";
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
import { useTheme } from "@/hooks/useTheme";

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
  showActions?: boolean;
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

export function AppHeader({
  title,
  locale,
  onImportPdf,
  onDownloadPdf,
  downloading,
  showActions = true,
  labels,
  helpLabels,
}: AppHeaderProps) {
  const { theme, setTheme, mounted } = useTheme();
  const [showHelp, setShowHelp] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    trackThemeToggle(next);
  };

  const openHelp = () => { setShowHelp(true); trackHelpOpened(); };
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  const actions = [
    { id: "import", label: labels.importPdf, icon: Upload, onClick: onImportPdf, disabled: false },
    { id: "download", label: downloading ? labels.generating : labels.downloadPdf, icon: FileDown, onClick: onDownloadPdf, disabled: downloading },
  ] as const;

  return (
    <header className="print:hidden border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <img src="/logo.png" alt={title} className="h-9 w-auto" />

        <div className="flex items-center gap-2">
          {/* Desktop action buttons — hidden during onboarding */}
          {showActions && actions.map((action) => (
            <Button
              key={action.id}
              variant={action.id === "download" ? "default" : "ghost"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="hidden md:inline-flex"
            >
              <action.icon className="h-4 w-4 mr-1" />
              {action.label}
            </Button>
          ))}

          <LanguageSwitcher locale={locale} />

          {/* Desktop help */}
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:inline-flex" onClick={openHelp} aria-label={labels.help}>
            <CircleHelp className="h-4 w-4" />
          </Button>

          {/* Desktop theme toggle */}
          {mounted && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:inline-flex" onClick={toggleTheme} aria-label={labels.themeToggle}>
              <ThemeIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" aria-label={labels.moreActions}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showActions && actions.map((action, i) => (
                <span key={action.id}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={action.onClick} disabled={action.disabled}>
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                </span>
              ))}
              {showActions && <DropdownMenuSeparator />}
              {mounted && (
                <>
                  <DropdownMenuItem onClick={toggleTheme}>
                    <ThemeIcon className="h-4 w-4" />
                    {labels.themeToggle}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={openHelp}>
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
