"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CvModel, LanguageEntry, LanguageProficiency } from "@/lib/model/CvModel";
import {
  LANGUAGE_CATALOG,
  resolveLanguageDisplayName,
} from "@/lib/cvLocale";

const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  "native",
  "full_professional",
  "professional_working",
  "limited_working",
  "elementary",
];

interface LanguageFormProps {
  labels: {
    label: string;
    placeholder: string;
    add: string;
    levelLabel: string;
    native: string;
    full_professional: string;
    professional_working: string;
    limited_working: string;
    elementary: string;
  };
}

export function LanguageForm({ labels }: LanguageFormProps) {
  const { control } = useFormContext<CvModel>();
  const [selectedValue, setSelectedValue] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [level, setLevel] = useState<LanguageProficiency>("professional_working");
  const uiLocale = useLocale();

  const levelLabel = (l: LanguageProficiency) => labels[l];

  const getDisplayName = (idOrText: string) => {
    const entry = LANGUAGE_CATALOG.find((e) => e.id === idOrText);
    if (entry) return uiLocale === "sv" ? entry.sv : entry.en;
    return idOrText;
  };

  return (
    <Controller
      control={control}
      name="languages"
      render={({ field }) => {
        const items: LanguageEntry[] = field.value ?? [];
        const existingIds = new Set(items.map((e) => e.name));

        const available = LANGUAGE_CATALOG.filter(
          (entry) => !existingIds.has(entry.id),
        );

        const addSelected = () => {
          const val = selectedValue.trim();
          if (!val) return;
          if (!existingIds.has(val)) {
            field.onChange([...items, { name: val, level }]);
          }
          setSelectedValue("");
          setPopoverOpen(false);
        };

        const removeItem = (index: number) => {
          field.onChange(items.filter((_, i) => i !== index));
        };

        const updateLevel = (index: number, newLevel: LanguageProficiency) => {
          const updated = items.map((item, i) =>
            i === index ? { ...item, level: newLevel } : item,
          );
          field.onChange(updated);
        };

        return (
          <div className="space-y-3">
            <Label className="text-xs">{labels.label}</Label>
            <div className="flex gap-2 items-center">
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="flex-1 min-w-0 justify-between font-normal"
                  >
                    <span className="truncate">
                      {selectedValue
                        ? getDisplayName(selectedValue)
                        : labels.placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder={labels.placeholder} />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {available.map((entry) => {
                          const displayName =
                            uiLocale === "sv" ? entry.sv : entry.en;
                          const secondaryName =
                            uiLocale === "sv" ? entry.en : entry.sv;
                          return (
                            <CommandItem
                              key={entry.id}
                              value={`${entry.en} ${entry.sv}`}
                              onSelect={() => {
                                setSelectedValue(
                                  selectedValue === entry.id ? "" : entry.id,
                                );
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedValue === entry.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <span>{displayName}</span>
                              <span className="ml-auto text-xs text-muted-foreground">
                                {secondaryName}
                              </span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Select
                value={level}
                onValueChange={(v) => setLevel(v as LanguageProficiency)}
              >
                <SelectTrigger className="shrink-0 w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {levelLabel(l)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSelected}
                disabled={!selectedValue}
              >
                {labels.add}
              </Button>
            </div>
            <div className="divide-y">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">
                    {resolveLanguageDisplayName(item.name, uiLocale)}
                  </span>
                  <Select
                    value={item.level}
                    onValueChange={(v) =>
                      updateLevel(i, v as LanguageProficiency)
                    }
                  >
                    <SelectTrigger size="sm" className="h-7 text-xs shrink-0 w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFICIENCY_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {levelLabel(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-muted-foreground hover:text-destructive shrink-0 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
