"use client";

import { TemplateSwitcher } from "@/components/TemplateSwitcher";

interface TemplateSelectionProps {
  label: string;
  templateId: string;
  onTemplateSelect: (id: string) => void;
}

export function TemplateSelection({ label, templateId, onTemplateSelect }: TemplateSelectionProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="text-sm font-medium">{label}</h3>
      <TemplateSwitcher activeId={templateId} onSelect={onTemplateSelect} />
    </div>
  );
}
