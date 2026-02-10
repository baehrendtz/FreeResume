const MONTHS_EN: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const MONTHS_SV: Record<string, number> = {
  januari: 1, februari: 2, mars: 3, april: 4, maj: 5, juni: 6,
  juli: 7, augusti: 8, september: 9, oktober: 10, november: 11, december: 12,
};

const ALL_MONTHS = { ...MONTHS_EN, ...MONTHS_SV };

const MONTH_NAMES = Object.keys(ALL_MONTHS).join("|");

const DATE_PATTERN = new RegExp(
  `((?:${MONTH_NAMES})\\s+\\d{4}|\\d{4})` +
    `\\s*[-–—]\\s*` +
    `((?:${MONTH_NAMES})\\s+\\d{4}|\\d{4}|present|nu|pågående|current)`,
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

  if (
    trimmed === "present" ||
    trimmed === "nu" ||
    trimmed === "pågående" ||
    trimmed === "current"
  ) {
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
    const monthNum = ALL_MONTHS[monthName];
    if (monthNum && /^\d{4}$/.test(year)) {
      return `${capitalize(monthName)} ${year}`;
    }
  }

  return raw.trim();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
