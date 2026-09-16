"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BulletListFieldProps {
  value: string[];
  onChange: (bullets: string[]) => void;
  labels: { add: string; remove: string; drag: string; placeholder: string };
}

/**
 * One row per bullet point. Enter adds a bullet below, Backspace on an empty
 * bullet removes it, pasted lines become separate bullets, and rows can be
 * reordered by dragging the handle or with Alt+Arrow keys.
 */
export function BulletListField({ value, onChange, labels }: BulletListFieldProps) {
  const inputRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Move focus once the list has re-rendered with the new rows
  useEffect(() => {
    if (pendingFocus.current === null) return;
    inputRefs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  });

  const commit = (next: string[], focusIndex?: number) => {
    if (focusIndex !== undefined) pendingFocus.current = focusIndex;
    onChange(next);
  };

  const insertAt = (index: number) => {
    const next = [...value];
    next.splice(index, 0, "");
    commit(next, index);
  };

  const removeAt = (index: number) => {
    commit(value.filter((_, i) => i !== index), Math.max(0, index - 1));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next, to);
  };

  return (
    <div className="space-y-2">
      {value.map((bullet, i) => (
        <div
          key={i}
          className={cn("flex items-start gap-1", dragIndex === i && "opacity-50")}
          onDragOver={(e) => {
            if (dragIndex !== null) e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null && dragIndex !== i) move(dragIndex, i);
            setDragIndex(null);
          }}
        >
          {/* Mouse drag handle, keyboard users reorder with Alt+Arrow in the field */}
          <span
            draggable
            onDragStart={(e) => {
              setDragIndex(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => setDragIndex(null)}
            title={labels.drag}
            aria-hidden
            className="mt-2 cursor-grab p-0.5 text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </span>
          <Textarea
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            rows={1}
            value={bullet}
            placeholder={i === 0 ? labels.placeholder : undefined}
            className="min-h-9 resize-none py-1.5"
            onChange={(e) => commit(value.map((b, j) => (j === i ? e.target.value.replace(/\n/g, " ") : b)))}
            onPaste={(e) => {
              const lines = e.clipboardData.getData("text").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
              if (lines.length < 2) return;
              e.preventDefault();
              const next = [...value];
              // Replace an empty bullet, otherwise add the pasted lines after it
              const at = bullet ? i + 1 : i;
              next.splice(at, bullet ? 0 : 1, ...lines);
              commit(next, at + lines.length - 1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                insertAt(i + 1);
              } else if (e.key === "Backspace" && bullet === "") {
                e.preventDefault();
                removeAt(i);
              } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
                e.preventDefault();
                move(i, e.key === "ArrowUp" ? i - 1 : i + 1);
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground"
            onClick={() => removeAt(i)}
            aria-label={labels.remove}
            title={labels.remove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => insertAt(value.length)}>
        <Plus className="h-4 w-4" />
        {labels.add}
      </Button>
    </div>
  );
}
