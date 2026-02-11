"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Trash2, Plus } from "lucide-react";
import type { CvModel, ExtrasGroup } from "@/lib/model/CvModel";

const ALL_CATEGORIES = [
  "certifications", "honors", "publications", "volunteering",
  "organizations", "courses", "projects", "patents", "other",
];

interface ExtrasFormProps {
  labels: {
    label: string;
    placeholder: string;
    add: string;
    addCategory: string;
    removeCategory: string;
  };
  categoryNames: Record<string, string>;
}

export function ExtrasForm({ labels, categoryNames }: ExtrasFormProps) {
  const { control } = useFormContext<CvModel>();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState("");

  return (
    <Controller
      control={control}
      name="extras"
      render={({ field }) => {
        const groups: ExtrasGroup[] = field.value ?? [];
        const usedCategories = groups.map((g) => g.category);
        const availableCategories = ALL_CATEGORIES.filter(
          (c) => !usedCategories.includes(c)
        );

        const addItem = (groupIndex: number) => {
          const category = groups[groupIndex].category;
          const trimmed = (inputs[category] ?? "").trim();
          if (!trimmed) return;
          const updated = groups.map((g, i) =>
            i === groupIndex ? { ...g, items: [...g.items, trimmed] } : g
          );
          field.onChange(updated);
          setInputs((prev) => ({ ...prev, [category]: "" }));
        };

        const removeItem = (groupIndex: number, itemIndex: number) => {
          const updated = groups.map((g, i) =>
            i === groupIndex
              ? { ...g, items: g.items.filter((_, j) => j !== itemIndex) }
              : g
          );
          field.onChange(updated);
        };

        const removeGroup = (groupIndex: number) => {
          field.onChange(groups.filter((_, i) => i !== groupIndex));
        };

        const addCategory = () => {
          const cat = newCategory || availableCategories[0];
          if (!cat || usedCategories.includes(cat)) return;
          field.onChange([...groups, { category: cat, items: [] }]);
          setNewCategory("");
        };

        return (
          <div className="space-y-4">
            <Label className="text-xs">{labels.label}</Label>

            {groups.map((group, gi) => (
              <div
                key={group.category}
                className="rounded-lg border bg-card p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold capitalize">
                    {categoryNames[group.category] ?? group.category}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeGroup(gi)}
                    title={labels.removeCategory}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item, ii) => (
                    <Badge key={ii} variant="secondary" className="gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeItem(gi, ii)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={inputs[group.category] ?? ""}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        [group.category]: e.target.value,
                      }))
                    }
                    placeholder={labels.placeholder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem(gi);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(gi)}
                  >
                    {labels.add}
                  </Button>
                </div>
              </div>
            ))}

            {availableCategories.length > 0 && (
              <div className="flex gap-2 items-center">
                <Select
                  value={newCategory || availableCategories[0] || ""}
                  onValueChange={(value) => setNewCategory(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryNames[cat] ?? cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCategory}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {labels.addCategory}
                </Button>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
