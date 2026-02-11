import type { PdfPage, PdfTextItem } from "@/lib/pdf/extractText";
import { type CvModel, createEmptyCvModel } from "@/lib/model/CvModel";
import { detectSection, detectExtrasCategory, type SectionType } from "./sectionDetector";
import { parseDateRange } from "./dateParser";

interface Line {
  text: string;
  bold: boolean;
  fontSize: number;
  y: number;
  x: number;
  page: number;
}

/**
 * Build lines from a set of PDF items (already filtered to one column).
 * Items on the same Y coordinate (within tolerance) on the same page are merged.
 */
function buildLines(items: (PdfTextItem & { page: number })[]): Line[] {
  // Sort by page asc, Y desc (top of page first), X asc
  const sorted = [...items].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
    return a.x - b.x;
  });

  const lines: Line[] = [];
  let currentGroup: typeof sorted = [];

  for (const item of sorted) {
    if (item.text.trim() === "") continue;

    if (
      currentGroup.length === 0 ||
      (Math.abs(item.y - currentGroup[0].y) <= 3 &&
        item.page === currentGroup[0].page)
    ) {
      currentGroup.push(item);
    } else {
      lines.push(groupToLine(currentGroup));
      currentGroup = [item];
    }
  }
  if (currentGroup.length > 0) {
    lines.push(groupToLine(currentGroup));
  }

  return lines;
}

function groupToLine(items: (PdfTextItem & { page: number })[]): Line {
  const text = items.map((i) => i.text).join(" ").trim();
  const bold = items.some((i) => i.bold);
  const fontSize = Math.max(...items.map((i) => i.fontSize));
  const x = Math.min(...items.map((i) => i.x));
  return { text, bold, fontSize, y: items[0].y, x, page: items[0].page };
}

/**
 * Find the X threshold that separates sidebar from main content on page 1.
 * LinkedIn PDFs have a clear gap between left sidebar (~x:22-150) and main content (~x:170+).
 *
 * Strategy: Bucket items by their "start of line" X position (the leftmost X per
 * horizontal band), then find the first large gap between the two major start-X clusters.
 */
function findColumnThreshold(items: PdfTextItem[]): number {
  if (items.length === 0) return 200;

  // Group items into lines by Y proximity and take only the min X per line.
  // This gives us the "column start" positions, ignoring inline sub-items.
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 3) return b.y - a.y;
    return a.x - b.x;
  });

  const lineStartXs: number[] = [];
  let prevY = -9999;
  for (const item of sorted) {
    if (item.text.trim() === "") continue;
    if (Math.abs(item.y - prevY) > 3) {
      // New line — record its starting X
      lineStartXs.push(Math.round(item.x));
      prevY = item.y;
    }
  }

  if (lineStartXs.length < 2) return 200;

  const uniqueStarts = [...new Set(lineStartXs)].sort((a, b) => a - b);

  // Find the first gap > 40 between consecutive unique start positions.
  // Place threshold just below the right cluster's starting X so that
  // all sub-items within the sidebar (which may have higher X) stay in the sidebar.
  for (let i = 1; i < uniqueStarts.length; i++) {
    const gap = uniqueStarts[i] - uniqueStarts[i - 1];
    if (gap > 40) {
      return uniqueStarts[i] - 10;
    }
  }

  return 200;
}

/**
 * Main entry point: parse a LinkedIn PDF export into a structured CvModel.
 * Handles the two-column layout (sidebar + main) on page 1,
 * with pages 2+ being single-column main content.
 */
export function parseLinkedInPdf(pages: PdfPage[]): CvModel {
  const cv = createEmptyCvModel();

  // Collect all items with page number
  const allItems: (PdfTextItem & { page: number })[] = [];
  for (const page of pages) {
    for (const item of page.items) {
      if (item.text.trim() === "") continue;
      allItems.push({ ...item, page: page.pageNumber });
    }
  }

  if (allItems.length === 0) return cv;

  // Determine column threshold from page 1 items
  const page1Items = allItems.filter((i) => i.page === 1);
  const xThreshold = findColumnThreshold(page1Items);

  // Split page 1 items into sidebar and main BEFORE building lines
  const sidebarItems = page1Items.filter((i) => i.x < xThreshold);
  const mainItemsPage1 = page1Items.filter((i) => i.x >= xThreshold);
  const laterItems = allItems.filter((i) => i.page > 1);

  // Build lines separately for each column
  const sidebarLines = buildLines(sidebarItems);
  const mainLines = [
    ...buildLines(mainItemsPage1),
    ...buildLines(laterItems),
  ];

  // Parse sidebar (contact, skills, languages)
  parseSidebar(cv, sidebarLines);

  // Parse main content (name, headline, summary, experience, education)
  parseMainContent(cv, mainLines);

  return cv;
}

function parseSidebar(cv: CvModel, lines: Line[]) {
  let currentSection: SectionType = "unknown";
  let currentExtrasCategory = "other";

  for (const line of lines) {
    const section = detectSection(line.text);

    if (section !== "unknown") {
      currentSection = section;
      if (section === "extras") {
        currentExtrasCategory = detectExtrasCategory(line.text);
      }
      continue;
    }

    switch (currentSection) {
      case "contact":
        extractContactInfo(cv, line.text);
        // Detect address/location lines
        if (!cv.location && isAddressLine(line.text)) {
          cv.location = line.text;
        }
        // Detect website URLs
        if (line.text.match(/\.\w{2,}/) && !line.text.includes("@")) {
          const cleaned = line.text
            .replace(/\s*\((?:LinkedIn|Company|Personal|Portfolio|Other)\)\s*/i, "")
            .trim();
          if (cleaned.toLowerCase().includes("linkedin")) {
            if (!cv.linkedIn) cv.linkedIn = cleaned;
          } else if (!cv.website) {
            cv.website = cleaned;
          }
        }
        break;
      case "skills":
        if (line.text.trim()) {
          cv.skills.push(line.text.trim());
        }
        break;
      case "languages": {
        const lang = line.text.trim();
        if (lang) {
          cv.languages.push(lang);
        }
        break;
      }
      case "extras": {
        const extra = line.text.trim();
        if (extra) {
          const existing = cv.extras.find((g) => g.category === currentExtrasCategory);
          if (existing) existing.items.push(extra);
          else cv.extras.push({ category: currentExtrasCategory, items: [extra] });
        }
        break;
      }
      default:
        // Before any section header, sidebar content might be contact info
        extractContactInfo(cv, line.text);
        break;
    }
  }
}

function parseMainContent(cv: CvModel, lines: Line[]) {
  if (lines.length === 0) return;

  let lineIndex = 0;

  // --- Extract name (first bold/large line) ---
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    if (lines[i].bold || lines[i].fontSize > 14) {
      cv.name = lines[i].text;
      lineIndex = i + 1;
      break;
    }
  }
  if (!cv.name && lines.length > 0) {
    cv.name = lines[0].text;
    lineIndex = 1;
  }

  // --- Extract headline and location (lines before first section header) ---
  // The headline may span multiple lines. We collect all lines before the first
  // section header that aren't locations, then join them.
  const headlineParts: string[] = [];
  for (let i = lineIndex; i < Math.min(lines.length, lineIndex + 8); i++) {
    const section = detectSection(lines[i].text);
    if (section !== "unknown") {
      lineIndex = i;
      break;
    }

    const text = lines[i].text.trim();
    if (text.length === 0 || isPageFooter(text)) continue;

    if (isLocation(text)) {
      cv.location = text;
      lineIndex = i + 1;
    } else {
      headlineParts.push(text);
      lineIndex = i + 1;
    }
  }
  if (headlineParts.length > 0) {
    cv.headline = headlineParts.join(" ");
  }

  // --- Find sections and parse them ---
  type SectionRange = {
    type: SectionType;
    startLine: number;
    endLine: number;
    headerText?: string;
  };
  const sections: SectionRange[] = [];

  for (let i = lineIndex; i < lines.length; i++) {
    const section = detectSection(lines[i].text);

    if (
      section !== "unknown" &&
      section !== "contact"
    ) {
      if (sections.length > 0) {
        sections[sections.length - 1].endLine = i;
      }
      sections.push({
        type: section,
        startLine: i + 1,
        endLine: lines.length,
        headerText: lines[i].text,
      });
    }
  }

  for (const section of sections) {
    const sectionLines = lines
      .slice(section.startLine, section.endLine)
      .filter((l) => !isPageFooter(l.text));

    switch (section.type) {
      case "summary":
        cv.summary = joinSummaryLines(sectionLines).trim();
        break;
      case "experience":
        cv.experience = parseExperience(sectionLines);
        break;
      case "education":
        cv.education = parseEducation(sectionLines);
        break;
      case "skills":
        cv.skills.push(...parseSkillLines(sectionLines));
        break;
      case "languages":
        cv.languages.push(
          ...sectionLines.map((l) => l.text.trim()).filter(Boolean)
        );
        break;
      case "extras": {
        const category = detectExtrasCategory(section.headerText ?? "");
        const items = parseExtras(sectionLines);
        if (items.length > 0) {
          const existing = cv.extras.find((g) => g.category === category);
          if (existing) existing.items.push(...items);
          else cv.extras.push({ category, items });
        }
        break;
      }
    }
  }
}

function parseExperience(lines: Line[]) {
  // Determine base font size (most common, typically 11 for body text)
  const baseFontSize = getBaseFontSize(lines);

  const entries: CvModel["experience"] = [];
  let current: CvModel["experience"][number] | null = null;
  let lastCompanyName = "";

  for (const line of lines) {
    const dateRange = parseDateRange(line.text);
    const isHeader = (line.bold || line.fontSize > baseFontSize + 0.5) &&
      !dateRange &&
      !isDurationOnly(line.text);

    if (isHeader) {
      // A header line is either a company name or a role title.
      // LinkedIn pattern: Company (header) → Role (header) → Date → Location → Description
      // For multi-role companies: Company (header) → Duration → Role1 (header) → Date → ...

      if (current && current.startDate) {
        // Current entry has dates, so it's complete. This header starts a new entry.
        entries.push(current);
        // Default to lastCompanyName; if this is actually a new company,
        // the two-consecutive-headers branch below will correct it.
        current = {
          title: line.text,
          company: lastCompanyName,
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          bullets: [],
        };
      } else if (current && !current.startDate) {
        // Two consecutive headers without a date between them —
        // the first was the company name, this is the role title.
        lastCompanyName = current.title;
        current.company = current.title;
        current.title = line.text;
      } else {
        // First entry
        current = {
          title: line.text,
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
          bullets: [],
        };
      }
    } else if (current) {
      if (dateRange) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
      } else if (isDurationOnly(line.text)) {
        // Skip duration-only lines (e.g., "5 år 4 månader")
      } else if (isBullet(line.text)) {
        current.bullets.push(cleanBullet(line.text));
      } else if (
        !current.location &&
        line.text.length < 60 &&
        looksLikeLocation(line.text)
      ) {
        current.location = line.text;
      } else if (line.text.trim()) {
        if (current.bullets.length > 0) {
          current.bullets.push(line.text);
        } else {
          current.description = appendText(current.description, line.text);
        }
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

function getBaseFontSize(lines: Line[]): number {
  const counts = new Map<number, number>();
  for (const line of lines) {
    const fs = Math.round(line.fontSize * 2) / 2; // round to 0.5
    counts.set(fs, (counts.get(fs) ?? 0) + 1);
  }
  let maxCount = 0;
  let baseFs = 11;
  for (const [fs, count] of counts) {
    // When tied on count, prefer the smaller font size as base
    // (headers use larger fonts, body text uses smaller)
    if (count > maxCount || (count === maxCount && fs < baseFs)) {
      maxCount = count;
      baseFs = fs;
    }
  }
  return baseFs;
}

function parseEducation(lines: Line[]) {
  const baseFontSize = getBaseFontSize(lines);
  const entries: CvModel["education"] = [];
  let current: CvModel["education"][number] | null = null;

  for (const line of lines) {
    const dateRange = parseDateRange(line.text);
    const isHeader =
      (line.bold || line.fontSize > baseFontSize + 0.5) && !dateRange;

    if (isHeader) {
      if (current) entries.push(current);
      current = {
        institution: line.text,
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
      };
    } else if (current) {
      if (dateRange) {
        current.startDate = dateRange.startDate;
        current.endDate = dateRange.endDate;
        // Also extract degree text if dates are inline (e.g. "Bachelor's degree, Economics · (2010 - 2012)")
        const textBeforeDates = line.text
          .replace(/·\s*\(.*\)$/, "")
          .replace(/\d{4}\s*[-–—]\s*(?:\d{4}|present|nu|pågående|current)/i, "")
          .trim();
        if (textBeforeDates && !current.degree) {
          if (textBeforeDates.includes(",")) {
            const [deg, ...rest] = textBeforeDates.split(",");
            current.degree = deg.trim();
            current.field = rest.join(",").trim();
          } else {
            current.degree = textBeforeDates;
          }
        }
      } else if (!current.degree) {
        // Degree line without dates
        const text = line.text.replace(/·\s*\(.*\)$/, "").trim();
        if (text.includes(",")) {
          const [deg, ...rest] = text.split(",");
          current.degree = deg.trim();
          current.field = rest.join(",").trim();
        } else {
          current.degree = text;
        }
      } else if (!current.field && line.text.length < 80) {
        current.field = line.text;
      } else {
        current.description = appendText(current.description, line.text);
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

function parseSkillLines(lines: Line[]) {
  const skills: string[] = [];
  for (const line of lines) {
    const text = cleanBullet(line.text);
    if (text.includes(",")) {
      skills.push(
        ...text
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else if (text.includes("·") || text.includes("•")) {
      skills.push(
        ...text
          .split(/[·•]/)
          .map((s) => s.trim())
          .filter(Boolean)
      );
    } else if (text.trim()) {
      skills.push(text.trim());
    }
  }
  return skills;
}

function parseExtras(lines: Line[]): string[] {
  const baseFontSize = getBaseFontSize(lines);
  const certs: string[] = [];

  for (const line of lines) {
    // Bold/large lines are certification names; skip issuer/date lines
    if (line.bold || line.fontSize > baseFontSize + 0.5) {
      const text = line.text.trim();
      if (text) certs.push(text);
    }
  }

  // Fallback: if no bold lines detected, treat each line as a cert name
  if (certs.length === 0) {
    for (const line of lines) {
      const text = line.text.trim();
      if (text) certs.push(text);
    }
  }

  return certs;
}

function extractContactInfo(cv: CvModel, text: string) {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (emailMatch && !cv.email) cv.email = emailMatch[0];

  const phoneMatch = text.match(/\+?\d[\d\s()-]{7,}\d/);
  if (phoneMatch && !cv.phone) cv.phone = phoneMatch[0].trim();

  if (text.toLowerCase().includes("linkedin.com") && !cv.linkedIn) {
    cv.linkedIn = text.replace(/\s*\(LinkedIn\)\s*/i, "").trim();
  }
}

function isAddressLine(text: string): boolean {
  // Address lines: contain numbers + street name, or postal codes
  return /\d{3}\s*\d{2}/.test(text) || /\d+\s+\w/.test(text.trim());
}

function isLocation(text: string): boolean {
  return /,/.test(text) && text.length < 80 && !/\d{4}/.test(text);
}

function looksLikeLocation(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    text.includes(",") ||
    lower.includes("sweden") ||
    lower.includes("sverige") ||
    lower.includes("county")
  );
}

function isPageFooter(text: string): boolean {
  return /^Page \d+ of \d+$/i.test(text.trim());
}

function isDurationOnly(text: string): boolean {
  return /^\d+\s*(år|year|month|månad)/i.test(text.trim());
}

function isBullet(text: string): boolean {
  return /^[\s]*[•\-\*·]/.test(text);
}

function cleanBullet(text: string): string {
  return text.replace(/^[\s]*[•\-\*·]\s*/, "").trim();
}

/**
 * Append text to an existing string, removing trailing line-break hyphens.
 * Handles PDF word-wrapping: "devel-" + "opment" → "development".
 */
function appendText(existing: string, next: string): string {
  if (!existing) return next;
  if (existing.endsWith("-")) return existing.slice(0, -1) + next;
  return existing + " " + next;
}

/**
 * Join an array of text segments, removing line-break hyphens between them.
 */
function joinTextLines(texts: string[]): string {
  let result = "";
  for (const text of texts) {
    result = appendText(result, text);
  }
  return result;
}

/**
 * Join summary lines preserving paragraph breaks.
 * Detects paragraph breaks by comparing Y-gaps between consecutive lines:
 * gaps > 1.8× the typical (median) line spacing are treated as paragraph breaks.
 */
function joinSummaryLines(lines: Line[]): string {
  if (lines.length === 0) return "";

  // Compute typical line spacing (median of Y-gaps between consecutive same-page lines)
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].page === lines[i - 1].page) {
      gaps.push(Math.abs(lines[i - 1].y - lines[i].y));
    }
  }
  const typicalGap =
    gaps.length > 0
      ? gaps.slice().sort((a, b) => a - b)[Math.floor(gaps.length / 2)]
      : 0;

  let result = lines[0].text;
  for (let i = 1; i < lines.length; i++) {
    const samePage = lines[i].page === lines[i - 1].page;
    const gap = samePage ? Math.abs(lines[i - 1].y - lines[i].y) : Infinity;
    const isParagraphBreak =
      !samePage || (typicalGap > 0 && gap > typicalGap * 1.8);

    if (isParagraphBreak) {
      result = result.trimEnd() + "\n\n" + lines[i].text;
    } else {
      result = appendText(result, lines[i].text);
    }
  }
  return result;
}
