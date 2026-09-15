import type { jsPDF } from "jspdf";
import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { PerTemplateStyleOverrides } from "@/lib/model/TemplateStyleSettings";
import { A4_WIDTH_PX, A4_WIDTH_MM, A4_HEIGHT_MM, PX_TO_PT, SAME_LINE_TOLERANCE_PX } from "@/lib/constants";

const SESSION_KEY = "freeresume-session";
/** Set when the user opted in to keeping their CV between visits. */
const REMEMBER_KEY = "freeresume-remember";

export interface SessionData {
  cv: CvModel;
  templateId: string;
  displaySettings?: DisplaySettings;
  styleOverrides?: PerTemplateStyleOverrides;
}

export function isRememberEnabled(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    return false;
  }
}

/** Opt in or out of keeping the CV in localStorage. Opting out deletes the stored copy. */
export function setRememberEnabled(enabled: boolean): void {
  try {
    if (enabled) {
      localStorage.setItem(REMEMBER_KEY, "1");
      const current = sessionStorage.getItem(SESSION_KEY);
      if (current) localStorage.setItem(SESSION_KEY, current);
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Storage full or unavailable, ignore
  }
}

export function saveSession(data: SessionData): void {
  const json = JSON.stringify(data);
  try {
    sessionStorage.setItem(SESSION_KEY, json);
    // Only kept across visits when the user opted in
    if (isRememberEnabled()) localStorage.setItem(SESSION_KEY, json);
  } catch {
    // Storage full or unavailable, ignore
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
      ?? (isRememberEnabled() ? localStorage.getItem(SESSION_KEY) : null);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

/** File name for downloads, e.g. "Anna_Andersson_CV.pdf". */
export function buildFileName(name: string, extension: string): string {
  return name ? `${name.replace(/\s+/g, "_")}_CV.${extension}` : `cv.${extension}`;
}

/**
 * Write the CV's text as an invisible layer over the page images. The PDF
 * looks identical, but its text can be selected, searched and read by
 * applicant tracking systems (ATS).
 */
function addInvisibleTextLayer(pdf: jsPDF, el: HTMLElement, totalPages: number): void {
  const origin = el.getBoundingClientRect();
  const mmPerPx = A4_WIDTH_MM / A4_WIDTH_PX;
  // Same page height the canvas is sliced by
  const pageHeightPx = A4_WIDTH_PX * (A4_HEIGHT_MM / A4_WIDTH_MM);
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);

  const writeLine = (text: string, left: number, top: number, fontSizePx: number) => {
    const page = Math.min(totalPages - 1, Math.max(0, Math.floor(top / pageHeightPx)));
    pdf.setPage(page + 1);
    pdf.setFontSize(fontSizePx * PX_TO_PT);
    pdf.text(text, left * mmPerPx, (top - page * pageHeightPx) * mmPerPx, {
      baseline: "top",
      renderingMode: "invisible",
    });
  };

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? "";
    const parent = node.parentElement;
    if (!parent || !text.trim()) continue;
    const fontSizePx = parseFloat(getComputedStyle(parent).fontSize);

    // Measure word by word and join words that share a rendered line, so
    // wrapped paragraphs keep their line breaks in the text layer
    let line: { text: string; left: number; top: number } | null = null;
    for (const word of text.matchAll(/\S+/g)) {
      const start = word.index ?? 0;
      range.setStart(node, start);
      range.setEnd(node, start + word[0].length);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0) continue;
      const left = rect.left - origin.left;
      const top = rect.top - origin.top;
      if (line && Math.abs(top - line.top) < SAME_LINE_TOLERANCE_PX) {
        line.text += ` ${word[0]}`;
      } else {
        if (line) writeLine(line.text, line.left, line.top, fontSizePx);
        line = { text: word[0], left, top };
      }
    }
    if (line) writeLine(line.text, line.left, line.top, fontSizePx);
  }
}

/**
 * Capture the #cv-preview element and download it as an A4 PDF with a
 * searchable text layer. Uses html2canvas-pro + jspdf, both lazy-loaded.
 */
export async function downloadPdf(name: string): Promise<void> {
  const el = document.getElementById("cv-preview");
  if (!el) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  // Temporarily remove CSS scale transform so html2canvas captures at full size.
  // Also force visibility: in multi-page mode the capture source is an off-screen
  // copy rendered with visibility hidden, which html2canvas would paint as blank.
  const savedTransform = el.style.transform;
  const savedWidth = el.style.width;
  const savedVisibility = el.style.visibility;
  el.style.transform = "none";
  el.style.width = `${A4_WIDTH_PX}px`;
  el.style.visibility = "visible";

  try {
    // Lower scale on mobile to avoid memory issues
    const isMobile = window.innerWidth < 1024;
    const canvas = await html2canvas(el, {
      scale: isMobile ? 2 : 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgW = canvas.width;
    const imgH = canvas.height;
    const scaleToWidth = A4_WIDTH_MM / imgW;
    const pageHeightPx = imgW * (A4_HEIGHT_MM / A4_WIDTH_MM); // A4 height in canvas pixels
    const totalPages = Math.max(1, Math.ceil(imgH / pageHeightPx));

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      // Slice a page-sized chunk from the canvas
      const sliceY = page * pageHeightPx;
      const sliceH = Math.min(pageHeightPx, imgH - sliceY);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = imgW;
      pageCanvas.height = Math.ceil(sliceH);
      const ctx = pageCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, -sliceY);

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.92);
      const pdfH = sliceH * scaleToWidth;
      pdf.addImage(pageImgData, "JPEG", 0, 0, A4_WIDTH_MM, pdfH, undefined, "FAST");
    }

    addInvisibleTextLayer(pdf, el, totalPages);
    pdf.setProperties({ title: name ? `${name} CV` : "CV", creator: "Free Resume" });
    pdf.save(buildFileName(name, "pdf"));
  } finally {
    el.style.transform = savedTransform;
    el.style.width = savedWidth;
    el.style.visibility = savedVisibility;
  }
}
