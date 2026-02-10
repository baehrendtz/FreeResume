"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CvModel } from "@/lib/model/CvModel";

interface SummaryFormProps {
  label: string;
  placeholder: string;
}

export function SummaryForm({ label, placeholder }: SummaryFormProps) {
  const { register } = useFormContext<CvModel>();

  return (
    <div className="space-y-1">
      <Label htmlFor="summary" className="text-xs">
        {label}
      </Label>
      <Textarea
        id="summary"
        rows={6}
        placeholder={placeholder}
        {...register("summary")}
      />
    </div>
  );
}
