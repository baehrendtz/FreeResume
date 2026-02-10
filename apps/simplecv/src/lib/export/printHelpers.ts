import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";

const STORAGE_KEY = "freeresume-print-data";
const SESSION_KEY = "freeresume-session";

interface SessionData {
  cv: CvModel;
  mode?: "upload" | "edit";
  templateId: string;
  displaySettings?: DisplaySettings;
}

export function saveSession(data: SessionData): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage full or unavailable — ignore
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function saveCvForPrint(cv: CvModel): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
}

export function loadCvForPrint(): CvModel | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CvModel;
  } catch {
    return null;
  }
}

export function triggerPrint(locale: string): void {
  window.open(`/${locale}/print`, "_blank");
}

/**
 * Capture the #cv-preview element and download it as an A4 PDF.
 * Uses html2canvas-pro + jspdf, both lazy-loaded.
 */
export async function downloadPdf(name: string): Promise<void> {
  const el = document.getElementById("cv-preview");
  if (!el) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  // A4 dimensions in mm
  const A4_W = 210;
  const A4_H = 297;

  // Temporarily remove CSS scale transform so html2canvas captures at full size
  const savedTransform = el.style.transform;
  const savedWidth = el.style.width;
  el.style.transform = "none";
  el.style.width = "794px";

  // Capture at 3x for sharp text in PDF
  const canvas = await html2canvas(el, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  // Restore transform
  el.style.transform = savedTransform;
  el.style.width = savedWidth;

  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const imgW = canvas.width;
  const imgH = canvas.height;

  // Fit to exactly one A4 page — scale down if content is taller than A4
  const scaleToWidth = A4_W / imgW;
  const heightAtFullWidth = imgH * scaleToWidth;

  let pdfW: number;
  let pdfH: number;

  if (heightAtFullWidth <= A4_H) {
    // Content fits within A4 height — use full width
    pdfW = A4_W;
    pdfH = heightAtFullWidth;
  } else {
    // Content is taller than A4 — scale to fit height, center horizontally
    const scaleToHeight = A4_H / imgH;
    pdfW = imgW * scaleToHeight;
    pdfH = A4_H;
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Center the image horizontally on the page
  const xOffset = (A4_W - pdfW) / 2;
  pdf.addImage(imgData, "JPEG", xOffset, 0, pdfW, pdfH, undefined, "FAST");

  const filename = name
    ? `${name.replace(/\s+/g, "_")}_CV.pdf`
    : "cv.pdf";
  pdf.save(filename);
}
