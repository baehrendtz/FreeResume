"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    description: string;
    bullets: string;
    add: string;
    remove: string;
    hide: string;
    show: string;
  };
}

export function ExperienceForm({ labels }: ExperienceFormProps) {
  const { register, control, watch, setValue } = useFormContext<CvModel>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const title = watch(`experience.${index}.title`);
        const company = watch(`experience.${index}.company`);
        const isHidden = watch(`experience.${index}.hidden`) ?? false;
        const summary = [title, company].filter(Boolean).join(" at ");

        return (
          <EntryCard
            key={field.id}
            summary={summary}
            hidden={isHidden}
            onToggleHidden={() => setValue(`experience.${index}.hidden`, !isHidden)}
            onRemove={() => { remove(index); trackExperienceRemove(); }}
            showSeparator={index > 0}
            labels={{ hide: labels.hide, show: labels.show, remove: labels.remove }}
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
              <div className="space-y-1 col-span-2 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{labels.startDate}</Label>
                  <Input {...register(`experience.${index}.startDate`)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{labels.endDate}</Label>
                  <Input {...register(`experience.${index}.endDate`)} />
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
