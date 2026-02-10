"use client";

import { useEffect, useState, useMemo } from "react";
import { type CvModel, createEmptyCvModel } from "@/lib/model/CvModel";
import { type DisplaySettings, defaultDisplaySettings } from "@/lib/model/DisplaySettings";
import { buildRenderModel } from "@/lib/fitting";
import { getTemplateMeta } from "@/templates/templateRegistry";
import { loadCvForPrint, loadSession } from "@/lib/export/printHelpers";
import { CvPreview } from "@/components/CvPreview";

export default function PrintPage() {
  const [cv, setCv] = useState<CvModel | null>(null);
  const [templateId, setTemplateId] = useState("basic");
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);

  useEffect(() => {
    const session = loadSession();
    const data = loadCvForPrint();
    /* eslint-disable react-hooks/set-state-in-effect -- Hydration: must set initial state from sessionStorage on mount */
    if (session?.templateId) setTemplateId(session.templateId);
    if (session?.displaySettings) setDisplaySettings(session.displaySettings);
    setCv(data ?? createEmptyCvModel());
    /* eslint-enable react-hooks/set-state-in-effect */
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, []);

  const templateMeta = useMemo(() => getTemplateMeta(templateId), [templateId]);
  const renderModel = useMemo(
    () => cv ? buildRenderModel(cv, templateMeta, displaySettings) : null,
    [cv, templateMeta, displaySettings],
  );

  if (!cv || !renderModel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <CvPreview renderModel={renderModel} templateId={templateId} />;
}
