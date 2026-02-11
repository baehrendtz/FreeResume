"use client";

import { ListForm } from "./ListForm";
import { trackSkillAdd, trackSkillRemove } from "@/lib/analytics/gtag";

interface SkillsFormProps {
  labels: { label: string; placeholder: string; add: string };
}

export function SkillsForm({ labels }: SkillsFormProps) {
  return (
    <ListForm
      fieldName="skills"
      labels={labels}
      onAdd={trackSkillAdd}
      onRemove={trackSkillRemove}
    />
  );
}
