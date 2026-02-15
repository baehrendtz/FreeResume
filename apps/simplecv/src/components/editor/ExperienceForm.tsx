"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Link, Unlink } from "lucide-react";
import { EntryCard } from "./EntryCard";
import type { CvModel } from "@/lib/model/CvModel";
import { trackExperienceAdd, trackExperienceRemove } from "@/lib/analytics/gtag";

interface ExperienceFormProps {
  labels: {
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
    groupWith?: string;
    ungroupFrom?: string;
  };
}

export function ExperienceForm({ labels }: ExperienceFormProps) {
  const { register, control, watch, setValue, getValues } = useFormContext<CvModel>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "experience",
  });

  const handleGroupWithPrevious = (index: number) => {
    const prevGroupId = getValues(`experience.${index - 1}.companyGroupId`);
    if (prevGroupId) {
      setValue(`experience.${index}.companyGroupId`, prevGroupId);
    }
  };

  const handleUngroupFromPrevious = (index: number) => {
    setValue(`experience.${index}.companyGroupId`, crypto.randomUUID());
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">{labels.emptyState}</p>
      )}

      {fields.map((field, index) => {
        const title = watch(`experience.${index}.title`);
        const company = watch(`experience.${index}.company`);
        const isHidden = watch(`experience.${index}.hidden`) ?? false;
        const currentGroupId = watch(`experience.${index}.companyGroupId`);
        const prevGroupId = index > 0 ? watch(`experience.${index - 1}.companyGroupId`) : undefined;
        const isGroupedWithPrevious = index > 0 && currentGroupId && currentGroupId === prevGroupId;
        const summary = title && company
          ? title + labels.at + company
          : title || company || "";

        return (
          <div key={field.id}>
            {isGroupedWithPrevious && (
              <div className="ml-3 border-l-2 border-primary/30 pl-2 -mt-2 mb-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Link className="h-3 w-3" />
                  {labels.groupWith ?? "Grouped with previous"}
                </span>
              </div>
            )}
          <EntryCard
            summary={summary}
            hidden={isHidden}
            onToggleHidden={() => setValue(`experience.${index}.hidden`, !isHidden)}
            onRemove={() => { remove(index); trackExperienceRemove(); }}
            onMoveUp={index > 0 ? () => move(index, index - 1) : undefined}
            onMoveDown={index < fields.length - 1 ? () => move(index, index + 1) : undefined}
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
            <div className="grid grid-cols-2 gap-3">
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
                <div className="col-span-2 flex items-center gap-2">
                  {isGroupedWithPrevious ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleUngroupFromPrevious(index)}
                    >
                      <Unlink className="h-3 w-3 mr-1" />
                      {labels.ungroupFrom ?? "Separate from group"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleGroupWithPrevious(index)}
                    >
                      <Link className="h-3 w-3 mr-1" />
                      {labels.groupWith ?? "Group with previous"}
                    </Button>
                  )}
                </div>
              )}
              <div className="space-y-1 col-span-2 grid grid-cols-2 gap-3">
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
      })}

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
