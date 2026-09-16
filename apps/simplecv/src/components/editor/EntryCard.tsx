"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CONFIRMATION_TIMEOUT_MS } from "@/lib/constants";

interface EntryCardProps {
  summary: string;
  /** Secondary line under the summary, e.g. the date range. */
  subtitle?: string;
  /** Short warning under the summary, e.g. that the entry doesn't fit in the CV. */
  note?: string;
  /** Whether the fields start expanded. Filled-in entries start collapsed so
   *  long imported lists stay easy to scan. */
  defaultOpen: boolean;
  hidden: boolean;
  onToggleHidden: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showSeparator: boolean;
  labels: {
    hide: string;
    show: string;
    remove: string;
    confirm: string;
    untitled: string;
    moveUp?: string;
    moveDown?: string;
  };
  children: ReactNode;
}

export function EntryCard({
  summary,
  subtitle,
  note,
  defaultOpen,
  hidden,
  onToggleHidden,
  onRemove,
  onMoveUp,
  onMoveDown,
  showSeparator,
  labels,
  children,
}: EntryCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRMATION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const handleRemoveClick = () => {
    if (confirming) {
      onRemove();
      setConfirming(false);
    } else {
      setConfirming(true);
    }
  };

  return (
    <div className="space-y-3">
      {showSeparator && <Separator />}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex flex-1 min-w-0 items-center gap-2 rounded-md -ml-1 pl-1 pr-2 py-1 text-left hover:bg-muted/50 transition-colors"
        >
          <ChevronRight
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
          />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-sm",
                hidden ? "line-through text-muted-foreground" : "font-medium",
                !summary && "text-muted-foreground",
              )}
            >
              {summary || labels.untitled}
            </span>
            {subtitle && (
              <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
            )}
            {note && (
              <span className="block truncate text-xs font-medium text-amber-600 dark:text-amber-400">{note}</span>
            )}
          </span>
        </button>
        {onMoveUp && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-9 w-9 md:h-7 md:w-7 text-muted-foreground shrink-0"
            onClick={onMoveUp}
            title={labels.moveUp}
            aria-label={labels.moveUp}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
        )}
        {onMoveDown && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-9 w-9 md:h-7 md:w-7 text-muted-foreground shrink-0"
            onClick={onMoveDown}
            title={labels.moveDown}
            aria-label={labels.moveDown}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        )}
        {/* Text labels collapse to icons on small screens to leave room for the summary */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 md:h-7 text-xs text-muted-foreground shrink-0"
          onClick={onToggleHidden}
          title={hidden ? labels.show : labels.hide}
          aria-label={hidden ? labels.show : labels.hide}
        >
          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{hidden ? labels.show : labels.hide}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`h-9 md:h-7 text-xs shrink-0 ${confirming ? "text-destructive font-medium" : "text-muted-foreground hover:text-destructive"}`}
          onClick={handleRemoveClick}
          title={labels.remove}
          aria-label={labels.remove}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className={confirming ? undefined : "hidden sm:inline"}>
            {confirming ? labels.confirm : labels.remove}
          </span>
        </Button>
      </div>
      {open && children}
    </div>
  );
}
