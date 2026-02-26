"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NumericStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  id?: string;
  /** Unit suffix displayed after the value (e.g. "%", "px") */
  unit?: string;
  /** When true, render an <input> instead of a static <span> */
  editable?: boolean;
}

export function NumericStepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  id,
  unit,
  editable,
}: NumericStepperProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="text-sm min-w-0 truncate" title={label}>
        {label}
      </label>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        {editable ? (
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= min && val <= max) {
                onChange(val);
              }
            }}
            className="w-16 text-center rounded-md border border-input bg-background px-2 h-8 text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        ) : (
          <span className="text-sm tabular-nums w-14 text-center font-medium">
            {value}{unit ?? ""}
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
