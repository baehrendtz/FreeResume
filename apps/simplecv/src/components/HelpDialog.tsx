"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: {
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
  };
}

export function HelpDialog({ open, onOpenChange, labels }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.intro}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-1.5">{labels.howItWorksTitle}</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>{labels.step1}</li>
              <li>{labels.step2}</li>
              <li>{labels.step3}</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-1">{labels.downloadTitle}</h4>
            <p className="text-muted-foreground">{labels.downloadText}</p>
          </div>

          <div>
            <h4 className="font-medium mb-1">{labels.dataTitle}</h4>
            <p className="text-muted-foreground">{labels.dataText}</p>
          </div>

          <p className="text-xs text-muted-foreground pt-2 border-t">
            {labels.footer}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
