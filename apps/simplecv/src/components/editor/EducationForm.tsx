"use client";

import { useCallback } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EntryCard } from "./EntryCard";
import type { CvModel } from "@/lib/model/CvModel";
import { trackEducationAdd, trackEducationRemove } from "@/lib/analytics/gtag";

interface EducationLabels {
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
}

interface EducationFormProps {
  labels: EducationLabels;
}

interface EducationEntryProps {
  index: number;
  total: number;
  labels: EducationLabels;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
}

/**
 * One education card. Split out so useWatch only re-renders the card being
 * edited instead of the whole list on every keystroke.
 */
function EducationEntry({ index, total, labels, onMove, onRemove }: EducationEntryProps) {
  const { register, control, setValue } = useFormContext<CvModel>();

  const institution = useWatch({ control, name: `education.${index}.institution` });
  const degree = useWatch({ control, name: `education.${index}.degree` });
  const isHidden = useWatch({ control, name: `education.${index}.hidden` }) ?? false;
  const summary = [institution, degree].filter(Boolean).join(" - ");

  return (
    <EntryCard
      summary={summary}
      hidden={isHidden}
      onToggleHidden={() => setValue(`education.${index}.hidden`, !isHidden)}
      onRemove={() => onRemove(index)}
      onMoveUp={index > 0 ? () => onMove(index, index - 1) : undefined}
      onMoveDown={index < total - 1 ? () => onMove(index, index + 1) : undefined}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1 sm:col-span-2">
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
        <div className="space-y-1 sm:col-span-2 grid grid-cols-2 gap-3">
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
      </div>

      <div className="space-y-1">
        <Label className="text-xs">{labels.description}</Label>
        <Textarea rows={2} {...register(`education.${index}.description`)} />
      </div>
    </EntryCard>
  );
}

export function EducationForm({ labels }: EducationFormProps) {
  const { control } = useFormContext<CvModel>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "education",
  });

  const handleRemove = useCallback((index: number) => {
    remove(index);
    trackEducationRemove();
  }, [remove]);

  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
  }, [move]);

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">{labels.emptyState}</p>
      )}

      {fields.map((field, index) => (
        <EducationEntry
          key={field.id}
          index={index}
          total={fields.length}
          labels={labels}
          onMove={handleMove}
          onRemove={handleRemove}
        />
      ))}

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
