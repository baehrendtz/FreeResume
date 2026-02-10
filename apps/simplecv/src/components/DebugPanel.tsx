"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PdfPage } from "@/lib/pdf/extractText";
import type { CvModel } from "@/lib/model/CvModel";

interface DebugPanelProps {
  rawPages: PdfPage[] | null;
  parsedCv: CvModel | null;
}

export function DebugPanel({ rawPages, parsedCv }: DebugPanelProps) {
  const [tab, setTab] = useState<"raw" | "parsed">("parsed");

  if (!rawPages && !parsedCv) return null;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm">Debug</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={tab === "parsed" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("parsed")}
            >
              Parsed
            </Button>
            <Button
              variant={tab === "raw" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTab("raw")}
            >
              Raw Text
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-xs overflow-auto max-h-96 bg-muted p-3 rounded">
          {tab === "raw"
            ? rawPages
                ?.map(
                  (p) =>
                    `--- Page ${p.pageNumber} ---\n` +
                    p.items.map((i) => `${i.bold ? "[B]" : "   "} x:${Math.round(i.x)} y:${Math.round(i.y)} fs:${Math.round(i.fontSize)} "${i.text}"`).join("\n")
                )
                .join("\n\n")
            : JSON.stringify(parsedCv, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
