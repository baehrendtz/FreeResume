"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { CvModel } from "@/lib/model/CvModel";
import { trackSkillAdd, trackSkillRemove } from "@/lib/analytics/gtag";

interface SkillsFormProps {
  labels: {
    label: string;
    placeholder: string;
    add: string;
  };
}

export function SkillsForm({ labels }: SkillsFormProps) {
  const { control } = useFormContext<CvModel>();
  const [input, setInput] = useState("");

  return (
    <Controller
      control={control}
      name="skills"
      render={({ field }) => {
        const skills = field.value ?? [];

        const addSkill = () => {
          const trimmed = input.trim();
          if (trimmed && !skills.includes(trimmed)) {
            field.onChange([...skills, trimmed]);
            setInput("");
            trackSkillAdd();
          }
        };

        const removeSkill = (index: number) => {
          field.onChange(skills.filter((_, i) => i !== index));
          trackSkillRemove();
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
                    addSkill();
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                {labels.add}
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
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
