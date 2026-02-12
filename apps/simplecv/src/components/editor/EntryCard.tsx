"use client";

import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface EntryCardProps {
  summary: string;
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
    confirm?: string;
    moveUp?: string;
    moveDown?: string;
  };
  children: ReactNode;
}

export function EntryCard({
  summary,
  hidden,
  onToggleHidden,
  onRemove,
  onMoveUp,
  onMoveDown,
  showSeparator,
  labels,
  children,
}: EntryCardProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
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
        <span
          className={`flex-1 text-sm truncate ${hidden ? "line-through text-muted-foreground" : "font-medium"}`}
        >
          {summary || "\u00A0"}
        </span>
        {onMoveUp && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-muted-foreground shrink-0"
            onClick={onMoveUp}
            title={labels.moveUp}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
        )}
        {onMoveDown && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 text-muted-foreground shrink-0"
            onClick={onMoveDown}
            title={labels.moveDown}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground shrink-0"
          onClick={onToggleHidden}
        >
          {hidden ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1" />
              {labels.show}
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 mr-1" />
              {labels.hide}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`h-7 text-xs shrink-0 ${confirming ? "text-destructive font-medium" : "text-muted-foreground hover:text-destructive"}`}
          onClick={handleRemoveClick}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          {confirming ? (labels.confirm ?? "Confirm?") : labels.remove}
        </Button>
      </div>
      {!hidden && children}
    </div>
  );
}
