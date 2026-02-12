"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { CvModel } from "@/lib/model/CvModel";
import { cn } from "@/lib/utils";

interface SummaryFormProps {
  label: string;
  placeholder: string;
  maxChars?: number;
}

export function SummaryForm({ label, placeholder, maxChars }: SummaryFormProps) {
  const { register, watch } = useFormContext<CvModel>();
  const summary = watch("summary") ?? "";
  const length = summary.length;

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
      {maxChars != null && maxChars > 0 && (
        <p
          className={cn(
            "text-xs text-right",
            length <= maxChars * 0.8
              ? "text-muted-foreground"
              : length <= maxChars
                ? "text-amber-500"
                : "text-destructive",
          )}
        >
          {length}/{maxChars}
        </p>
      )}
    </div>
  );
}
