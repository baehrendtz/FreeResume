"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface EntryCardProps {
  summary: string;
  hidden: boolean;
  onToggleHidden: () => void;
  onRemove: () => void;
  showSeparator: boolean;
  labels: { hide: string; show: string; remove: string };
  children: ReactNode;
}

export function EntryCard({
  summary,
  hidden,
  onToggleHidden,
  onRemove,
  showSeparator,
  labels,
  children,
}: EntryCardProps) {
  return (
    <div className="space-y-3">
      {showSeparator && <Separator />}
      <div className="flex items-center gap-2">
        <span
          className={`flex-1 text-sm truncate ${hidden ? "line-through text-muted-foreground" : "font-medium"}`}
        >
          {summary || "\u00A0"}
        </span>
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
          className="h-7 text-xs text-muted-foreground hover:text-destructive shrink-0"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          {labels.remove}
        </Button>
      </div>
      {!hidden && children}
    </div>
  );
}
