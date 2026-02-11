"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { CvModel } from "@/lib/model/CvModel";

interface ListFormProps {
  fieldName: "skills" | "languages";
  labels: { label: string; placeholder: string; add: string };
  onAdd?: () => void;
  onRemove?: () => void;
}

export function ListForm({ fieldName, labels, onAdd, onRemove }: ListFormProps) {
  const { control } = useFormContext<CvModel>();
  const [input, setInput] = useState("");

  return (
    <Controller
      control={control}
      name={fieldName}
      render={({ field }) => {
        const items: string[] = field.value ?? [];

        const addItem = () => {
          const trimmed = input.trim();
          if (trimmed && !items.includes(trimmed)) {
            field.onChange([...items, trimmed]);
            setInput("");
            onAdd?.();
          }
        };

        const removeItem = (index: number) => {
          field.onChange(items.filter((_, i) => i !== index));
          onRemove?.();
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
                    addItem();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                {labels.add}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {items.map((item, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
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
