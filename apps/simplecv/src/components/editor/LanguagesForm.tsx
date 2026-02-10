"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { CvModel } from "@/lib/model/CvModel";

interface LanguagesFormProps {
  labels: {
    label: string;
    placeholder: string;
    add: string;
  };
}

export function LanguagesForm({ labels }: LanguagesFormProps) {
  const { control } = useFormContext<CvModel>();
  const [input, setInput] = useState("");

  return (
    <Controller
      control={control}
      name="languages"
      render={({ field }) => {
        const languages = field.value ?? [];

        const addLanguage = () => {
          const trimmed = input.trim();
          if (trimmed && !languages.includes(trimmed)) {
            field.onChange([...languages, trimmed]);
            setInput("");
          }
        };

        const removeLanguage = (index: number) => {
          field.onChange(languages.filter((_, i) => i !== index));
        };

        return (
          <div className="space-y-3">
            <Label className="text-xs">{labels.label}</Label>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={labels.placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addLanguage}>
                {labels.add}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(i)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
