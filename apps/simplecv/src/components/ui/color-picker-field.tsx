"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  /** Quick-pick swatches shown under the picker. */
  presets?: readonly string[];
}

export function ColorPickerField({ label, value, onChange, id, presets }: ColorPickerFieldProps) {
  return (
    <div className="space-y-2 py-0.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-8 p-0.5 cursor-pointer"
          />
          <span className="text-xs text-muted-foreground font-mono w-16">
            {value}
          </span>
        </div>
      </div>
      {presets && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((color) => {
            const isSelected = value.toLowerCase() === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => onChange(color)}
                aria-label={`${label}: ${color}`}
                aria-pressed={isSelected}
                title={color}
                className={cn(
                  "h-6 w-6 rounded-full border border-black/10 transition-transform",
                  isSelected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : "hover:scale-110",
                )}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
