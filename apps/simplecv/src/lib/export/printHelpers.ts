import type { CvModel } from "@/lib/model/CvModel";
import type { DisplaySettings } from "@/lib/model/DisplaySettings";
import type { PerTemplateStyleOverrides } from "@/lib/model/TemplateStyleSettings";
import { A4_WIDTH_PX } from "@/lib/constants";

const SESSION_KEY = "freeresume-session";

interface SessionData {
  cv: CvModel;
  templateId: string;
  displaySettings?: DisplaySettings;
  styleOverrides?: PerTemplateStyleOverrides;
}

export function saveSession(data: SessionData): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage full or unavailable, ignore
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
    const scaleToWidth = A4_W / imgW;
    const pageHeightPx = imgW * (A4_H / A4_W); // A4 height in canvas pixels
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
      pdf.addImage(pageImgData, "JPEG", 0, 0, A4_W, pdfH, undefined, "FAST");
    }

    const filename = name
      ? `${name.replace(/\s+/g, "_")}_CV.pdf`
      : "cv.pdf";
    pdf.save(filename);
  } finally {
    el.style.transform = savedTransform;
    el.style.width = savedWidth;
    el.style.visibility = savedVisibility;
  }
}
