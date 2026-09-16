"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MONTH_LOOKUP, isPresentToken } from "@/lib/cvLocale";
import { YEAR_PICKER_MIN } from "@/lib/constants";

/** Month names written into the CV data. English abbreviations are understood
 *  by formatCvDate and the experience date sorting in every CV language. */
const MONTH_KEYS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const PRESENT_VALUE = "Present";

const SELECT_CLASS =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30";

interface ParsedDate {
  month: number | null;
  year: number | null;
}

/** Parse "Sep 2020", "September 2020", "2020" or "". Returns null for free text the pickers can't show. */
function parseDate(raw: string): ParsedDate | null {
  const trimmed = raw.trim();
  if (!trimmed) return { month: null, year: null };
  if (/^\d{4}$/.test(trimmed)) return { month: null, year: Number(trimmed) };
  const match = trimmed.match(/^([A-Za-zÀ-ÖØ-öø-ÿ]+)\s+(\d{4})$/);
  const month = match ? MONTH_LOOKUP[match[1].toLowerCase()] : undefined;
  return match && month ? { month, year: Number(match[2]) } : null;
}

function formatDate({ month, year }: ParsedDate): string {
  if (!year) return "";
  return month ? `${MONTH_KEYS[month - 1]} ${year}` : String(year);
}

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Show an "Ongoing" switch, for end dates. */
  allowOngoing?: boolean;
  labels: { month: string; year: string; ongoing: string; placeholder: string };
}

/** Month and year pickers that store dates in a format the CV templates understand. */
export function DateField({ id, label, value, onChange, allowOngoing = false, labels }: DateFieldProps) {
  const locale = useLocale();
  const ongoing = allowOngoing && isPresentToken(value);
  const parsed = parseDate(value);

  const monthNames = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: "long" });
    return MONTH_KEYS.map((_, i) => {
      const name = format.format(new Date(Date.UTC(YEAR_PICKER_MIN, i, 1)));
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
  }, [locale]);

  const currentYear = new Date().getFullYear();
  const parsedYear = parsed?.year ?? null;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear + 1; y >= YEAR_PICKER_MIN; y--) list.push(y);
    // Keep an imported year outside the range selectable
    if (parsedYear && !list.includes(parsedYear)) list.unshift(parsedYear);
    return list;
  }, [currentYear, parsedYear]);

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      {ongoing ? (
        <p className="flex h-9 items-center text-sm text-muted-foreground">{labels.ongoing}</p>
      ) : parsed ? (
        <div className="flex gap-2">
          <select
            id={id}
            aria-label={`${label}: ${labels.month}`}
            className={SELECT_CLASS}
            value={parsed.month ?? ""}
            onChange={(e) => {
              const month = e.target.value ? Number(e.target.value) : null;
              // A month is only stored together with a year, default to this year
              onChange(formatDate({ month, year: parsed.year ?? currentYear }));
            }}
          >
            <option value="">{labels.month}</option>
            {monthNames.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            aria-label={`${label}: ${labels.year}`}
            className={SELECT_CLASS}
            value={parsed.year ?? ""}
            onChange={(e) => onChange(formatDate({ month: parsed.month, year: e.target.value ? Number(e.target.value) : null }))}
          >
            <option value="">{labels.year}</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      ) : (
        // Free text from an import that the pickers can't represent stays editable as text
        <Input id={id} value={value} placeholder={labels.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {allowOngoing && (
        <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <Switch checked={ongoing} onCheckedChange={(checked) => onChange(checked ? PRESENT_VALUE : "")} />
          {labels.ongoing}
        </label>
      )}
    </div>
  );
}
