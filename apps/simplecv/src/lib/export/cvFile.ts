import { buildFileName, type SessionData } from "@/lib/export/printHelpers";
import type { CvModel } from "@/lib/model/CvModel";
import { parseSessionCv } from "@/lib/model/sessionCv";

/** Marks a JSON file as a Free Resume CV so unrelated JSON is rejected. */
const CV_FILE_APP_ID = "freeresume";
const CV_FILE_VERSION = 1;
const DEFAULT_TEMPLATE_ID = "basic";

/** True if the file looks like a saved CV file rather than a PDF. */
export function isCvFile(file: File): boolean {
  return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}

/** Download the CV and its settings as a file the user can open again later. */
export function downloadCvFile(data: SessionData): void {
  const payload = { app: CV_FILE_APP_ID, version: CV_FILE_VERSION, ...data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildFileName(data.cv.name, "json");
  link.click();
  // Revoke after the click has been handled, Safari needs the URL until then
  setTimeout(() => URL.revokeObjectURL(url));
}

/** Read and validate a saved CV file. Throws if it isn't a usable Free Resume file. */
export async function readCvFile(file: File): Promise<SessionData> {
  const data = JSON.parse(await file.text()) as Partial<SessionData> & { app?: string };
  if (data?.app !== CV_FILE_APP_ID || !data.cv) {
    throw new Error("Not a Free Resume CV file");
  }
  const cv = parseSessionCv(data.cv as CvModel);
  if (!cv) throw new Error("CV file failed validation");
  return {
    cv,
    templateId: typeof data.templateId === "string" ? data.templateId : DEFAULT_TEMPLATE_ID,
    displaySettings: data.displaySettings,
    styleOverrides: data.styleOverrides,
  };
}
