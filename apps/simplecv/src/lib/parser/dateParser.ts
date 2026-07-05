import { MONTH_LOOKUP, PRESENT_TOKENS, isPresentToken } from "@/lib/cvLocale";

const MONTH_NAMES = Object.keys(MONTH_LOOKUP).join("|");
const PRESENT_NAMES = [...PRESENT_TOKENS].join("|");

const DATE_PATTERN = new RegExp(
  `\\b((?:${MONTH_NAMES})\\s+\\d{4}|\\d{4})\\b` +
    // Match hyphen, en dash or em dash between the dates (escapes keep the
    // literal dash characters out of the source per the typography rule)
    `\\s*[-\\u2013\\u2014]\\s*` +
    `\\b((?:${MONTH_NAMES})\\s+\\d{4}|\\d{4}|${PRESENT_NAMES})\\b`,
  "i"
);

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function parseDateRange(text: string): DateRange | null {
  const match = text.match(DATE_PATTERN);
  if (!match) return null;

  return {
    startDate: normalizeDate(match[1]),
    endDate: normalizeDate(match[2]),
  };
}

function normalizeDate(raw: string): string {
  const trimmed = raw.trim().toLowerCase();

  if (isPresentToken(trimmed)) {
    return "Present";
  }

  // Year only
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Month Year
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2) {
    const monthName = parts[0];
    const year = parts[1];
    const monthNum = MONTH_LOOKUP[monthName];
    if (monthNum && /^\d{4}$/.test(year)) {
      return `${capitalize(monthName)} ${year}`;
    }
  }

  return raw.trim();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
