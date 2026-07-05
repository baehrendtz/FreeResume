"use client";

import { useCallback } from "react";
import { useFormContext, useFieldArray, useWatch, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Link, Unlink } from "lucide-react";
import { EntryCard } from "./EntryCard";
import type { CvModel } from "@/lib/model/CvModel";
import { trackExperienceAdd, trackExperienceRemove } from "@/lib/analytics/gtag";

interface ExperienceLabels {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  datePlaceholder: string;
  endDatePlaceholder: string;
  description: string;
  bullets: string;
  bulletsHint: string;
  add: string;
  remove: string;
  hide: string;
  show: string;
  at: string;
  emptyState: string;
  confirm: string;
  moveUp: string;
  moveDown: string;
  groupWith: string;
  ungroupFrom: string;
}

interface ExperienceFormProps {
  labels: ExperienceLabels;
}

interface ExperienceEntryProps {
  index: number;
  total: number;
  labels: ExperienceLabels;
  onMove: (fromIndex: number, toIndex: number) => void;
  onRemove: (index: number) => void;
  onGroupWithPrevious: (index: number) => void;
  onUngroupFromPrevious: (index: number) => void;
}

/**
 * One experience card. Split out so useWatch only re-renders the card being
 * edited instead of the whole list on every keystroke.
 */
function ExperienceEntry({
  index,
  total,
  labels,
  onMove,
  onRemove,
  onGroupWithPrevious,
  onUngroupFromPrevious,
}: ExperienceEntryProps) {
  const { register, control, setValue } = useFormContext<CvModel>();

  const title = useWatch({ control, name: `experience.${index}.title` });
  const company = useWatch({ control, name: `experience.${index}.company` });
  const isHidden = useWatch({ control, name: `experience.${index}.hidden` }) ?? false;
  const currentGroupId = useWatch({ control, name: `experience.${index}.companyGroupId` });
  // Hooks can't be conditional, watch index 0 for the first entry and ignore the value
  const prevGroupId = useWatch({ control, name: `experience.${Math.max(0, index - 1)}.companyGroupId` });
  const isGroupedWithPrevious = index > 0 && !!currentGroupId && currentGroupId === prevGroupId;

  const summary = title && company
    ? title + labels.at + company
    : title || company || "";

  return (
    <div>
      {isGroupedWithPrevious && (
        <div className="ml-3 border-l-2 border-primary/30 pl-2 -mt-2 mb-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Link className="h-3 w-3" />
            {labels.groupWith}
          </span>
        </div>
      )}
      <EntryCard
        summary={summary}
        hidden={isHidden}
        onToggleHidden={() => setValue(`experience.${index}.hidden`, !isHidden)}
        onRemove={() => onRemove(index)}
        onMoveUp={index > 0 ? () => onMove(index, index - 1) : undefined}
        onMoveDown={index < total - 1 ? () => onMove(index, index + 1) : undefined}
        showSeparator={index > 0 && !isGroupedWithPrevious}
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
          <div className="space-y-1">
            <Label className="text-xs">{labels.title}</Label>
            <Input {...register(`experience.${index}.title`)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{labels.company}</Label>
            <Input {...register(`experience.${index}.company`)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{labels.location}</Label>
            <Input {...register(`experience.${index}.location`)} />
          </div>
          {index > 0 && (
            <div className="sm:col-span-2 flex items-center gap-2">
              {isGroupedWithPrevious ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onUngroupFromPrevious(index)}
                >
                  <Unlink className="h-3 w-3 mr-1" />
                  {labels.ungroupFrom}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onGroupWithPrevious(index)}
                >
                  <Link className="h-3 w-3 mr-1" />
                  {labels.groupWith}
                </Button>
              )}
            </div>
          )}
          <div className="space-y-1 sm:col-span-2 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{labels.startDate}</Label>
              <Input
                {...register(`experience.${index}.startDate`)}
                placeholder={labels.datePlaceholder}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{labels.endDate}</Label>
              <Input
                {...register(`experience.${index}.endDate`)}
                placeholder={labels.endDatePlaceholder}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{labels.description}</Label>
          <Textarea rows={2} {...register(`experience.${index}.description`)} />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{labels.bullets}</Label>
          <Controller
            control={control}
            name={`experience.${index}.bullets`}
            render={({ field: bulletField }) => (
              <Textarea
                rows={4}
                value={(bulletField.value ?? []).join("\n")}
                onChange={(e) => {
                  const lines = e.target.value.split("\n");
                  bulletField.onChange(lines);
                }}
              />
            )}
          />
          <p className="text-xs text-muted-foreground">{labels.bulletsHint}</p>
        </div>
      </EntryCard>
    </div>
  );
}

export function ExperienceForm({ labels }: ExperienceFormProps) {
  const { control, setValue, getValues } = useFormContext<CvModel>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experience",
  });

  const handleGroupWithPrevious = useCallback((index: number) => {
    const prevGroupId = getValues(`experience.${index - 1}.companyGroupId`);
    if (prevGroupId) {
      setValue(`experience.${index}.companyGroupId`, prevGroupId);
    } else {
      const newId = crypto.randomUUID();
      setValue(`experience.${index - 1}.companyGroupId`, newId);
      setValue(`experience.${index}.companyGroupId`, newId);
    }
  }, [getValues, setValue]);

  const handleUngroupFromPrevious = useCallback((index: number) => {
    setValue(`experience.${index}.companyGroupId`, crypto.randomUUID());
  }, [setValue]);

  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
    // Assign a fresh groupId to the moved entry so it doesn't stay
    // silently grouped with its old neighbor after being moved away.
    setValue(`experience.${toIndex}.companyGroupId`, crypto.randomUUID());
  }, [move, setValue]);

  const handleRemove = useCallback((index: number) => {
    remove(index);
    trackExperienceRemove();
  }, [remove]);

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">{labels.emptyState}</p>
      )}

      {fields.map((field, index) => (
        <ExperienceEntry
          key={field.id}
          index={index}
          total={fields.length}
          labels={labels}
          onMove={handleMove}
          onRemove={handleRemove}
          onGroupWithPrevious={handleGroupWithPrevious}
          onUngroupFromPrevious={handleUngroupFromPrevious}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          append({
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            description: "",
            bullets: [],
            hidden: false,
            companyGroupId: crypto.randomUUID(),
          });
          trackExperienceAdd();
        }}
      >
        <Plus className="h-4 w-4 mr-1" />
        {labels.add}
      </Button>
    </div>
  );
}
