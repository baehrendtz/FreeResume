"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EntryCard } from "./EntryCard";
import type { CvModel } from "@/lib/model/CvModel";
import { trackEducationAdd, trackEducationRemove } from "@/lib/analytics/gtag";

interface EducationFormProps {
  labels: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    datePlaceholder: string;
    endDatePlaceholder: string;
    description: string;
    add: string;
    remove: string;
    hide: string;
    show: string;
    emptyState: string;
    confirm: string;
    moveUp: string;
    moveDown: string;
  };
}

export function EducationForm({ labels }: EducationFormProps) {
  const { register, control, watch, setValue } = useFormContext<CvModel>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">{labels.emptyState}</p>
      )}

      {fields.map((field, index) => {
        const institution = watch(`education.${index}.institution`);
        const degree = watch(`education.${index}.degree`);
        const isHidden = watch(`education.${index}.hidden`) ?? false;
        const summary = [institution, degree].filter(Boolean).join(" - ");

        return (
          <EntryCard
            key={field.id}
            summary={summary}
            hidden={isHidden}
            onToggleHidden={() => setValue(`education.${index}.hidden`, !isHidden)}
            onRemove={() => { remove(index); trackEducationRemove(); }}
            onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
            onMoveDown={index < fields.length - 1 ? () => move(index, index + 1) : undefined}
            showSeparator={index > 0}
            labels={{
              hide: labels.hide,
              show: labels.show,
              remove: labels.remove,
              confirm: labels.confirm,
              moveUp: labels.moveUp,
              moveDown: labels.moveDown,
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs">{labels.institution}</Label>
                <Input {...register(`education.${index}.institution`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{labels.degree}</Label>
                <Input {...register(`education.${index}.degree`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{labels.field}</Label>
                <Input {...register(`education.${index}.field`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{labels.startDate}</Label>
                <Input
                  {...register(`education.${index}.startDate`)}
                  placeholder={labels.datePlaceholder}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{labels.endDate}</Label>
                <Input
                  {...register(`education.${index}.endDate`)}
                  placeholder={labels.endDatePlaceholder}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{labels.description}</Label>
              <Textarea rows={2} {...register(`education.${index}.description`)} />
            </div>
          </EntryCard>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          append({
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            description: "",
            hidden: false,
          });
          trackEducationAdd();
        }}
      >
        <Plus className="h-4 w-4 mr-1" />
        {labels.add}
      </Button>
    </div>
  );
}
