"use client";

import { useState } from "react";
import { User, MoreHorizontal, FileDown, ChevronDown, ExternalLink } from "lucide-react";

interface LinkedInGuideProps {
  labels: {
    guideStep1: string;
    guideStep2: string;
    guideStep3: string;
    howToGetPdf: string;
    openLinkedIn: string;
  };
}

/** LinkedIn redirects this to the signed-in user's own profile. */
const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/me/";

const STEPS = [
  { icon: User, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: MoreHorizontal, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
  { icon: FileDown, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
] as const;

export function LinkedInGuide({ labels }: LinkedInGuideProps) {
  // Open by default, most people have never exported their profile before
  const [open, setOpen] = useState(true);
  const stepTexts = [labels.guideStep1, labels.guideStep2, labels.guideStep3];

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <span>{labels.howToGetPdf}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ol className="mt-3 space-y-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2">
                <div className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 ${step.bg}`}>
                  <span className={`text-xs font-bold ${step.color}`}>{i + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs leading-relaxed">{stepTexts[i]}</p>
                  {i === 0 && (
                    <a
                      href={LINKEDIN_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {labels.openLinkedIn}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className={`shrink-0 ${step.bg} rounded-md p-1`}>
                  <Icon className={`h-3.5 w-3.5 ${step.color}`} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
