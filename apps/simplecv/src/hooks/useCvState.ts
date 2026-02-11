"use client";

import { useState, useEffect, useMemo } from "react";
import { type CvModel, createEmptyCvModel } from "@/lib/model/CvModel";
import { type DisplaySettings, defaultDisplaySettings } from "@/lib/model/DisplaySettings";
import { buildRenderModel } from "@/lib/fitting";
import { getTemplateMeta } from "@/templates/templateRegistry";
import { saveSession, loadSession } from "@/lib/export/printHelpers";
import { findLanguageId } from "@/lib/cvLocale";

function migrateExtras(cv: CvModel): CvModel {
  const extras = cv.extras as unknown;
  if (Array.isArray(extras) && extras.length > 0 && typeof extras[0] === "string") {
    return { ...cv, extras: [{ category: "other", items: extras as string[] }] };
  }
  return cv;
}

function migrateLanguages(cv: CvModel): CvModel {
  const languages = cv.languages as unknown;
  if (Array.isArray(languages) && languages.length > 0 && typeof languages[0] === "string") {
    return {
      ...cv,
      languages: (languages as string[]).map((name) => ({
        name,
        level: "professional_working" as const,
      })),
    };
  }
  return cv;
}

function migrateLanguageNames(cv: CvModel): CvModel {
  const changed = cv.languages.map((lang) => {
    const id = findLanguageId(lang.name);
    return id ? { ...lang, name: id } : lang;
  });
  return { ...cv, languages: changed };
}

function loadInitialState() {
  const session = loadSession();
  if (session) {
    return {
      cv: migrateLanguageNames(migrateLanguages(migrateExtras(session.cv))),
      templateId: session.templateId,
      displaySettings: { ...defaultDisplaySettings, ...session.displaySettings },
      hadSavedSession: true,
    };
  }
  return {
    cv: createEmptyCvModel(),
    templateId: "basic",
    displaySettings: defaultDisplaySettings,
    hadSavedSession: false,
  };
}

export function useCvState(persistenceEnabled: boolean) {
  const [initial] = useState(loadInitialState);
  const [cv, setCv] = useState<CvModel>(initial.cv);
  const [templateId, setTemplateId] = useState(initial.templateId);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(initial.displaySettings);
  const hadSavedSession = initial.hadSavedSession;

  const templateMeta = useMemo(() => getTemplateMeta(templateId), [templateId]);
  const renderModel = useMemo(
    () => buildRenderModel(cv, templateMeta, displaySettings),
    [cv, templateMeta, displaySettings],
  );

  // Save session whenever edit state changes
  useEffect(() => {
    if (persistenceEnabled) {
      saveSession({ cv, templateId, displaySettings });
    }
  }, [cv, persistenceEnabled, templateId, displaySettings]);

  return {
    cv, setCv,
    templateId, setTemplateId,
    displaySettings, setDisplaySettings,
    templateMeta, renderModel,
    hadSavedSession,
  };
}
