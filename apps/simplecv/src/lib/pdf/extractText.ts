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

export async function extractText(file: File): Promise<PdfPage[]> {
  const pdfjsLib = await import("pdfjs-dist");
  type TextItem = import("pdfjs-dist/types/src/display/api").TextItem;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

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
