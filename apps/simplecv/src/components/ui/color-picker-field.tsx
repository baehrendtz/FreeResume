"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}

export function ColorPickerField({ label, value, onChange, id }: ColorPickerFieldProps) {
  return (
    <div className="flex items-center justify-between py-0.5">
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
  );
}
