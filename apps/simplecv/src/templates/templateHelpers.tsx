import type { ReactNode } from "react";
import { MapPin, Mail, Phone, Linkedin, Globe } from "lucide-react";
import type { LanguageEntry } from "@/lib/model/CvModel";
import type {
  RenderModel,
  RenderExperience,
  RenderExperienceGroup,
  RenderExperienceRole,
  RenderEducation,
  RenderExtrasGroup,
} from "@/lib/fitting/types";
import { cn } from "@/lib/utils";
import { getCvStrings, resolveLanguageName, formatCvDate, translateExtrasCategory, type CvLanguage } from "@/lib/cvLocale";

/**
 * Build inline styles for the CV root container that counter-scale width/height
 * so that CSS `zoom` only affects text/spacing — not the overall A4 dimensions.
 *
 * Pre-zoom width:  210mm / fontZoom  →  after zoom: (210mm / z) × z = 210mm ✓
 * Pre-zoom height: 297mm / fontZoom  →  after zoom: (297mm / z) × z = 297mm ✓
 */
export function scaledContainerStyle(
  fontZoom: number,
  lineHeight: number,
  extra?: React.CSSProperties,
): React.CSSProperties {
  return {
    zoom: fontZoom,
    width: `calc(210mm / ${fontZoom})`,
    minHeight: `calc(297mm / ${fontZoom})`,
    lineHeight,
    ...extra,
  };
}

/**
 * Format a date range like "Sep 2025 – Present" (en) or "Sep 2025 – Pågående" (sv).
 * Uses locale-aware formatting via formatCvDate.
 */
export function formatDateRange(startDate: string, endDate: string, cvLanguage: CvLanguage = "en"): string {
  if (!startDate && !endDate) return "";
  if (startDate && !endDate) return formatCvDate(startDate, cvLanguage);
  if (!startDate && endDate) return formatCvDate(endDate, cvLanguage);
  return `${formatCvDate(startDate, cvLanguage)} – ${formatCvDate(endDate, cvLanguage)}`;
}

export interface ContactItem {
  icon: ReactNode;
  value: string;
}

/**
 * Returns filtered non-empty contact items with matching icons.
 * Templates choose how to render them (list, inline, grid, etc.).
 */
export function getContactItems(cv: Pick<RenderModel, "location" | "email" | "phone" | "linkedIn" | "website">): ContactItem[] {
  const items: { icon: ReactNode; value: string; raw: string }[] = [
    { icon: <MapPin className="h-3 w-3" />, value: cv.location, raw: cv.location },
    { icon: <Mail className="h-3 w-3" />, value: cv.email, raw: cv.email },
    { icon: <Phone className="h-3 w-3" />, value: cv.phone, raw: cv.phone },
    { icon: <Linkedin className="h-3 w-3" />, value: cv.linkedIn, raw: cv.linkedIn },
    { icon: <Globe className="h-3 w-3" />, value: cv.website, raw: cv.website },
  ];
  return items.filter((item) => item.raw);
}

/**
 * Reusable section heading. Templates can override style via className.
 */
export function SectionTitle({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      className={cn(
        "text-[8pt] font-bold uppercase tracking-wider border-b pb-px mb-1",
        className,
      )}
      style={style}
    >
      {children}
    </h2>
  );
}

/**
 * Shared footer for all CV templates.
 * Use inside a flex-col parent with min-h so `mt-auto` pushes it to the bottom.
 */
export function CvFooter({
  name,
  className,
  accentBar,
  accentColorHex,
}: {
  name: string;
  className?: string;
  accentBar?: boolean;
  accentColorHex?: string;
}) {
  return (
    <footer className={cn("mt-auto", className)}>
      {accentBar && accentColorHex && (
        <div className="h-1.5" style={{ backgroundColor: accentColorHex }} />
      )}
      <div
        className={cn(
          "flex justify-between pt-1.5 pb-2",
          accentBar
            ? "text-[8pt] text-gray-500"
            : "text-[8pt] text-gray-500 border-t border-gray-200",
        )}
      >
        <span className="font-medium">{name}</span>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Shared rendering components
// ---------------------------------------------------------------------------

interface ExperienceItemProps {
  exp: RenderExperience;
  layout: "title-first" | "company-first";
  className?: string;
  dateClassName?: string;
  titleClassName?: string;
  companyClassName?: string;
  bulletClassName?: string;
  cvLanguage: CvLanguage;
  lineHeightScale?: number;
}

export function ExperienceItem({
  exp,
  layout,
  className,
  dateClassName = "text-[7.5pt] text-gray-500 whitespace-nowrap ml-4",
  titleClassName = "font-bold text-[8.5pt]",
  companyClassName = "text-[7.5pt] text-gray-500",
  bulletClassName = "text-[8.5pt] text-gray-700",
  cvLanguage,
  lineHeightScale,
}: ExperienceItemProps) {
  const dateStr = formatDateRange(exp.startDate, exp.endDate, cvLanguage);
  const filteredBullets = exp.bullets?.filter((b) => b.trim()) ?? [];

  const primaryLabel = layout === "title-first" ? exp.title : exp.company;
  const secondaryLabel = layout === "title-first" ? exp.company : exp.title;
  const secondaryStyle =
    layout === "title-first"
      ? companyClassName
      : "text-[8pt] font-medium text-gray-700";

  return (
    <div className={cn("mb-1.5 break-inside-avoid", className)}>
      <div className="flex justify-between items-baseline">
        <h3 className={titleClassName}>{primaryLabel}</h3>
        {dateStr && <span className={dateClassName}>{dateStr}</span>}
      </div>
      <div className="flex justify-between">
        <span className={secondaryStyle}>{secondaryLabel}</span>
        {layout === "title-first" && exp.location && (
          <span className={companyClassName}>{exp.location}</span>
        )}
      </div>
      {layout === "company-first" && exp.location && (
        <p className="text-[7pt] italic text-gray-400">{exp.location}</p>
      )}
      {exp.description && (
        <p
          className="text-[7.5pt] text-gray-700 mt-0.5 whitespace-pre-line"
          style={{ lineHeight: 1.4 * (lineHeightScale ?? 1) }}
        >
          {exp.description}
        </p>
      )}
      {filteredBullets.length > 0 && (
        <ul className="list-disc list-outside ml-3.5 mt-0.5 space-y-0">
          {filteredBullets.map((bullet, j) => (
            <li key={j} className={bulletClassName}>
              {bullet}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ExperienceGroupItemProps {
  group: RenderExperienceGroup;
  layout: "title-first" | "company-first";
  className?: string;
  dateClassName?: string;
  titleClassName?: string;
  companyClassName?: string;
  bulletClassName?: string;
  cvLanguage: CvLanguage;
  lineHeightScale?: number;
  accentColor?: string;
}

export function ExperienceGroupItem({
  group,
  layout,
  className,
  dateClassName = "text-[7.5pt] text-gray-500 whitespace-nowrap ml-4",
  titleClassName = "font-bold text-[8.5pt]",
  companyClassName = "text-[7.5pt] text-gray-500",
  bulletClassName = "text-[8.5pt] text-gray-700",
  cvLanguage,
  lineHeightScale,
  accentColor = "#6b7280",
}: ExperienceGroupItemProps) {
  if (group.isSingleRole) {
    // Single role — render like the old ExperienceItem
    const role = group.roles[0];
    const exp: RenderExperience = {
      title: role.title,
      company: group.company,
      location: role.location,
      startDate: role.startDate,
      endDate: role.endDate,
      description: role.description,
      bullets: role.bullets,
    };
    return (
      <ExperienceItem
        exp={exp}
        layout={layout}
        className={className}
        dateClassName={dateClassName}
        titleClassName={titleClassName}
        companyClassName={companyClassName}
        bulletClassName={bulletClassName}
        cvLanguage={cvLanguage}
        lineHeightScale={lineHeightScale}
      />
    );
  }

  // Multi-role group — company header with sub-roles
  const groupDateStr = formatDateRange(group.startDate, group.endDate, cvLanguage);
  const primaryLabel = layout === "title-first" ? group.company : group.company;

  return (
    <div className={cn("mb-1.5 break-inside-avoid", className)}>
      {/* Company header */}
      <div className="flex justify-between items-baseline">
        <h3 className={titleClassName}>{primaryLabel}</h3>
        {groupDateStr && <span className={dateClassName}>{groupDateStr}</span>}
      </div>
      {group.location && (
        <p className={companyClassName}>{group.location}</p>
      )}

      {/* Sub-roles with left border */}
      <div
        className="ml-1 mt-1 pl-2.5 space-y-1"
        style={{ borderLeft: `2px solid ${accentColor}30` }}
      >
        {group.roles.map((role, j) => {
          const roleDateStr = formatDateRange(role.startDate, role.endDate, cvLanguage);
          const filteredBullets = role.bullets?.filter((b) => b.trim()) ?? [];
          return (
            <div key={j} className="break-inside-avoid">
              <div className="flex justify-between items-baseline">
                <h4 className="font-semibold text-[8pt]">{role.title}</h4>
                {roleDateStr && (
                  <span className={dateClassName}>{roleDateStr}</span>
                )}
              </div>
              {role.location && role.location !== group.location && (
                <p className="text-[7pt] text-gray-400">{role.location}</p>
              )}
              {role.description && (
                <p
                  className="text-[7.5pt] text-gray-700 mt-0.5 whitespace-pre-line"
                  style={{ lineHeight: 1.4 * (lineHeightScale ?? 1) }}
                >
                  {role.description}
                </p>
              )}
              {filteredBullets.length > 0 && (
                <ul className="list-disc list-outside ml-3.5 mt-0.5 space-y-0">
                  {filteredBullets.map((bullet, k) => (
                    <li key={k} className={bulletClassName}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface EducationItemProps {
  edu: RenderEducation;
  className?: string;
  dateClassName?: string;
  institutionClassName?: string;
  degreeClassName?: string;
  cvLanguage: CvLanguage;
  lineHeightScale?: number;
}

export function EducationItem({
  edu,
  className,
  dateClassName = "text-[7.5pt] text-gray-500 whitespace-nowrap ml-4",
  institutionClassName = "font-bold text-[8.5pt]",
  degreeClassName = "text-[7.5pt] text-gray-500",
  cvLanguage,
  lineHeightScale,
}: EducationItemProps) {
  const dateStr = formatDateRange(edu.startDate, edu.endDate, cvLanguage);
  return (
    <div className={cn("mb-1.5 break-inside-avoid", className)}>
      <div className="flex justify-between items-baseline">
        <h3 className={institutionClassName}>{edu.institution}</h3>
        {dateStr && <span className={dateClassName}>{dateStr}</span>}
      </div>
      {(edu.degree || edu.field) && (
        <p className={degreeClassName}>
          {edu.degree}
          {edu.field ? ` — ${edu.field}` : ""}
        </p>
      )}
      {edu.description && (
        <p
          className="text-[7.5pt] mt-0.5 text-gray-700"
          style={{ lineHeight: 1.4 * (lineHeightScale ?? 1) }}
        >
          {edu.description}
        </p>
      )}
    </div>
  );
}

interface SkillsListProps {
  skills: string[];
  variant: "pills" | "bullets" | "inline";
  className?: string;
  pillClassName?: string;
  pillStyle?: React.CSSProperties;
}

export function SkillsList({
  skills,
  variant,
  className,
  pillClassName = "px-2 py-0.5 bg-teal-50 text-teal-800 text-[7.5pt] rounded-full border border-teal-200",
  pillStyle,
}: SkillsListProps) {
  if (variant === "inline") {
    return (
      <p className={cn("text-[7.5pt] text-gray-700", className)}>
        {skills.join(", ")}
      </p>
    );
  }
  if (variant === "bullets") {
    return (
      <ul className={cn("space-y-0.5 text-[7.5pt] text-gray-700", className)}>
        {skills.map((skill, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
            {skill}
          </li>
        ))}
      </ul>
    );
  }
  // pills
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {skills.map((skill, i) => (
        <span key={i} className={pillClassName} style={pillStyle}>
          {skill}
        </span>
      ))}
    </div>
  );
}

function formatLanguageEntry(entry: LanguageEntry, cvLanguage: CvLanguage): string {
  const labels = getCvStrings(cvLanguage);
  const displayName = resolveLanguageName(entry.name, cvLanguage);
  return `${displayName} (${labels[entry.level]})`;
}

interface LanguagesListProps {
  languages: LanguageEntry[];
  variant: "pills" | "bullets";
  cvLanguage?: CvLanguage;
  className?: string;
  pillClassName?: string;
  pillStyle?: React.CSSProperties;
}

export function LanguagesList({
  languages,
  variant,
  cvLanguage = "en",
  className,
  pillClassName = "px-2 py-0.5 bg-teal-50 text-teal-800 text-[7.5pt] rounded-full border border-teal-200",
  pillStyle,
}: LanguagesListProps) {
  if (variant === "bullets") {
    return (
      <ul className={cn("space-y-0.5 text-[7.5pt] text-gray-700", className)}>
        {languages.map((lang, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-500 shrink-0" />
            {formatLanguageEntry(lang, cvLanguage)}
          </li>
        ))}
      </ul>
    );
  }
  // pills
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {languages.map((lang, i) => (
        <span key={i} className={pillClassName} style={pillStyle}>
          {formatLanguageEntry(lang, cvLanguage)}
        </span>
      ))}
    </div>
  );
}

interface ExtrasListProps {
  extras: RenderExtrasGroup[];
  className?: string;
  categoryClassName?: string;
  itemClassName?: string;
  cvLanguage: CvLanguage;
}

export function ExtrasList({
  extras,
  className,
  categoryClassName = "text-[8pt] font-semibold text-teal-700 mb-0.5",
  itemClassName = "text-[8.5pt] text-gray-700",
  cvLanguage,
}: ExtrasListProps) {
  return (
    <div className={className}>
      {extras.map((group, i) => (
        <div key={i} className="mb-1.5">
          <h3 className={categoryClassName}>
            {translateExtrasCategory(group.category, cvLanguage)}
          </h3>
          <ul className="list-disc list-outside ml-4 space-y-0">
            {group.items.map((item, j) => (
              <li key={j} className={itemClassName}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
