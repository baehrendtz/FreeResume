import { FileDown, Send } from "lucide-react";

interface LinkedInSaveMockProps {
  labels: {
    openTo: string;
    addSection: string;
    resources: string;
    sendProfile: string;
    savePdf: string;
  };
}

/**
 * Simplified drawing of the buttons under a LinkedIn profile name, pointing
 * at the menu item people look for. Not a screenshot and carries no LinkedIn
 * branding, the step text next to it holds the actual instruction.
 */
export function LinkedInSaveMock({ labels }: LinkedInSaveMockProps) {
  return (
    <div aria-hidden className="w-full max-w-sm rounded-xl border bg-card p-3 text-xs shadow-xs">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-2 w-28 rounded-full bg-muted-foreground/30" />
          <div className="h-2 w-40 rounded-full bg-muted" />
        </div>
      </div>

      <div className="mt-3 w-fit">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border px-2.5 py-1 text-muted-foreground">{labels.openTo}</span>
          <span className="rounded-full border px-2.5 py-1 text-muted-foreground">{labels.addSection}</span>
          <span className="rounded-full border-2 border-primary px-2.5 py-1 font-semibold text-primary">
            {labels.resources}
          </span>
        </div>
        <div className="mt-1.5 flex justify-end">
          <div className="w-56 overflow-hidden rounded-md border bg-popover py-1 shadow-md">
            <div className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground">
              <Send className="h-3.5 w-3.5" />
              {labels.sendProfile}
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 font-semibold text-primary">
              <FileDown className="h-3.5 w-3.5" />
              {labels.savePdf}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
