"use client";

import { cn } from "@/lib/utils";
import { FileText, Layout, Sparkles } from "lucide-react";
import { templates } from "@/templates/templateRegistry";

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  basic: <FileText className="h-3.5 w-3.5" />,
  professional: <Layout className="h-3.5 w-3.5" />,
  creative: <Sparkles className="h-3.5 w-3.5" />,
};

interface TemplateSwitcherProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function TemplateSwitcher({ activeId, onSelect }: TemplateSwitcherProps) {
  return (
    <div className="flex items-center rounded-full bg-muted p-0.5">
      {Object.entries(templates).map(([id, entry]) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-sm rounded-full transition-all",
            id === activeId
              ? "bg-background text-foreground shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {TEMPLATE_ICONS[id]}
          {entry.name}
        </button>
      ))}
    </div>
  );
}
