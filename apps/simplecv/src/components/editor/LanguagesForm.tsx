"use client";

import { ListForm } from "./ListForm";

interface LanguagesFormProps {
  labels: { label: string; placeholder: string; add: string };
}

export function LanguagesForm({ labels }: LanguagesFormProps) {
  return <ListForm fieldName="languages" labels={labels} />;
}
