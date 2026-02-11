"use client";

interface AppFooterProps {
  labels: {
    copyright: string;
    openSource: string;
    cookieSettings: string;
  };
}

export function AppFooter({ labels }: AppFooterProps) {
  return (
    <footer className="print:hidden border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{labels.copyright}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("show-cookie-consent"))}
            className="hover:text-foreground transition-colors"
          >
            {labels.cookieSettings}
          </button>
          <a
            href="https://github.com/baehrendtz/FreeResume"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            {labels.openSource}
          </a>
        </div>
      </div>
    </footer>
  );
}
