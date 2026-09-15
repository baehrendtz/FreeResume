"use client";

import { useState, useEffect, useMemo } from "react";
import { type CvModel, createEmptyCvModel } from "@/lib/model/CvModel";
import { type DisplaySettings, defaultDisplaySettings } from "@/lib/model/DisplaySettings";
import { type PerTemplateStyleOverrides, resolveStyleSettings } from "@/lib/model/TemplateStyleSettings";
import { buildRenderModel } from "@/lib/fitting";
import { getTemplateMeta, getTemplateDefaultStyle } from "@/templates/templateRegistry";
import { saveSession, loadSession } from "@/lib/export/printHelpers";
import { parseSessionCv } from "@/lib/model/sessionCv";

function loadInitialState() {
  const session = loadSession();
  const cv = session ? parseSessionCv(session.cv) : null;
  if (session && cv) {
    return {
      cv,
      templateId: session.templateId,
      displaySettings: { ...defaultDisplaySettings, ...session.displaySettings },
      styleOverrides: session.styleOverrides ?? {},
      hadSavedSession: true,
    };
  }
  return {
    cv: createEmptyCvModel(),
    templateId: "basic",
    displaySettings: defaultDisplaySettings,
    styleOverrides: {},
    hadSavedSession: false,
  };
}

export function useCvState(persistenceEnabled: boolean) {
  const [initial] = useState(loadInitialState);
  const [cv, setCv] = useState<CvModel>(initial.cv);
  const [templateId, setTemplateId] = useState(initial.templateId);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(initial.displaySettings);
  const [styleOverrides, setStyleOverrides] = useState<PerTemplateStyleOverrides>(initial.styleOverrides);
  const hadSavedSession = initial.hadSavedSession;

  const templateMeta = useMemo(() => getTemplateMeta(templateId), [templateId]);
  const renderModel = useMemo(
    () => buildRenderModel(cv, templateMeta, displaySettings),
    [cv, templateMeta, displaySettings],
  );

  const styleSettings = useMemo(
    () => resolveStyleSettings(templateId, getTemplateDefaultStyle(templateId), styleOverrides),
    [templateId, styleOverrides],
  );

  // Save session whenever edit state changes. A restored session must keep
  // persisting even though the onboarding flag never flips (onboarding is
  // skipped entirely when a session exists).
  const persist = persistenceEnabled || hadSavedSession;
  useEffect(() => {
    if (persist) {
      saveSession({ cv, templateId, displaySettings, styleOverrides });
    }
  }, [cv, persist, templateId, displaySettings, styleOverrides]);

  return {
    cv, setCv,
    templateId, setTemplateId,
    displaySettings, setDisplaySettings,
    styleOverrides, setStyleOverrides,
    styleSettings,
    templateMeta, renderModel,
    hadSavedSession,
  };
}
