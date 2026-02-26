export interface PdfTextItem {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
}

export interface PdfPage {
  pageNumber: number;
  items: PdfTextItem[];
}

const MAX_PDF_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PDF_PAGES = 20;

export async function extractText(file: File): Promise<PdfPage[]> {
  if (file.type && file.type !== "application/pdf") {
    throw new Error(`Invalid file type: expected PDF, got ${file.type}`);
  }
  if (file.size > MAX_PDF_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB exceeds 10 MB limit`);
  }

  const pdfjsLib = await import("pdfjs-dist");
  type TextItem = import("pdfjs-dist/types/src/display/api").TextItem;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pdf.numPages > MAX_PDF_PAGES) {
    throw new Error(`PDF has ${pdf.numPages} pages, exceeds ${MAX_PDF_PAGES} page limit`);
  }

  const pages: PdfPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const items: PdfTextItem[] = [];
    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      const textItem = item as TextItem;
      const fontName = textItem.fontName || "";
      const bold =
        fontName.toLowerCase().includes("bold") ||
        fontName.toLowerCase().includes("semibold");

      items.push({
        text: textItem.str,
        x: textItem.transform[4],
        y: textItem.transform[5],
        fontSize: Math.abs(textItem.transform[0]),
        fontName,
        bold,
      });
    }

    pages.push({ pageNumber: i, items });
  }

  return pages;
}
