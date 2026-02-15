"use client";

import type { RenderModel } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getCvStrings, resolveLanguageName, translateExtrasCategory } from "@/lib/cvLocale";
import {
  scaledContainerStyle,
  getContactItems,
  formatDateRange,
  CvFooter,
} from "./templateHelpers";

interface TemplateProps {
  cv: RenderModel;
  styleSettings?: TemplateStyleValues;
}

/* ── Sidebar section heading ── */
function SidebarHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="mb-2.5">
      <h2
        className="text-[9.5pt] font-bold uppercase tracking-[0.18em] pb-1.5 mb-0"
        style={{ color, borderBottom: `2.5px solid ${color}`, display: "inline-block" }}
      >
        {children}
      </h2>
    </div>
  );
}

/* ── Main section heading with circle icon ── */
function MainSectionHeading({
  children,
  color,
  icon,
}: {
  children: React.ReactNode;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span
        className="flex items-center justify-center h-[22px] w-[22px] rounded-full text-white shrink-0"
        style={{ backgroundColor: color }}
      >
        {icon}
      </span>
      <h2
        className="text-[12pt] font-bold uppercase tracking-[0.06em]"
        style={{ color }}
      >
        {children}
      </h2>
    </div>
  );
}

/* ── Timeline dot ── */
function TimelineDot({ color, filled = false }: { color: string; filled?: boolean }) {
  return (
    <div
      className="absolute left-[-3.5px] top-[5px] h-[8px] w-[8px] rounded-full"
      style={
        filled
          ? { backgroundColor: color }
          : { backgroundColor: "white", border: `2px solid ${color}` }
      }
    />
  );
}

export default function TemplateBasic2({ cv, styleSettings }: TemplateProps) {
  const labels = getCvStrings(cv.cvLanguage ?? "en");
  const contactItems = getContactItems(cv);
  const filteredBullets = (bullets: string[]) => bullets?.filter((b) => b.trim()) ?? [];

  const accent = styleSettings?.accentColor ?? "#4a6fa5";
  const photoSize = styleSettings?.photoSizePx ?? 128;
  const fontZoom = (styleSettings?.fontSizePercent ?? 100) / 100;
  const photoShape = styleSettings?.photoShape ?? "circle";
  const photoShapeClass =
    photoShape === "circle" ? "rounded-full" :
    photoShape === "rounded" ? "rounded-lg" : "rounded-none";
  const sidebarBg = styleSettings?.sidebarBgColor ?? "#dce4ed";
  const timelineColor = "#c0c8d4";
  const BASE_LINE_HEIGHT = 1.35;
  const lineHeight = BASE_LINE_HEIGHT * (styleSettings?.lineHeightPercent ?? 100) / 100;

  return (
    <div
      lang={cv.cvLanguage}
      className="cv-template font-sans text-[8pt] text-gray-800 mx-auto bg-white flex flex-col overflow-hidden"
      style={scaledContainerStyle(fontZoom, lineHeight, { borderRadius: "16px" })}
    >
      <div className="flex flex-1 relative">
        {/* Sidebar background — absolute div for html2canvas compatibility */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[34%]"
          style={{ backgroundColor: sidebarBg, borderRadius: "16px 0 0 16px" }}
        />

        {/* ============ SIDEBAR ============ */}
        <aside className="w-[34%] shrink-0 relative px-5 pt-5 pb-4 flex flex-col">
          {/* Photo */}
          {cv.photo && (
            <div className="flex justify-center mb-5">
              <img
                src={cv.photo}
                alt=""
                className={`${photoShapeClass} object-cover border-[3px] border-white`}
                style={{ width: photoSize, height: photoSize, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
              />
            </div>
          )}

          {/* Contact */}
          {contactItems.length > 0 && (
            <div className="mb-4">
              <SidebarHeading color={accent}>{labels.contact}</SidebarHeading>
              <ul className="space-y-1.5 text-[7.5pt] text-gray-700">
                {contactItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="shrink-0 mt-[1px]" style={{ color: accent }}>{item.icon}</span>
                    <span className="break-all leading-snug">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary / Professional Profile */}
          {cv.summary && (
            <div className="mb-4">
              <SidebarHeading color={accent}>{labels.summary}</SidebarHeading>
              <p className="text-[7.5pt] text-gray-700 leading-[1.5] whitespace-pre-line">
                {cv.summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {cv.skills.length > 0 && (
            <div className="mb-4">
              <SidebarHeading color={accent}>{labels.skills}</SidebarHeading>
              <ul className="space-y-1 text-[7.5pt] text-gray-700">
                {cv.skills.map((skill, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="h-[5px] w-[5px] rounded-full shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {cv.languages.length > 0 && (
            <div className="mb-4">
              <SidebarHeading color={accent}>{labels.languages}</SidebarHeading>
              <ul className="space-y-1 text-[7.5pt] text-gray-700">
                {cv.languages.map((lang, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="h-[5px] w-[5px] rounded-full shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                    {resolveLanguageName(lang.name, cv.cvLanguage)} ({labels[lang.level]})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1 px-5 pt-5 pb-4 min-w-0 flex flex-col">
          {/* Header: Name + Headline */}
          <header className="mb-4">
            <h1
              className="text-[24pt] font-bold tracking-tight leading-none"
              style={{ color: accent }}
            >
              {(cv.name || labels.yourName).toUpperCase()}
            </h1>
            {cv.headline && (
              <p className="text-[10pt] font-bold text-gray-600 mt-1.5 tracking-[0.04em]">
                {cv.headline.toUpperCase()}
              </p>
            )}
          </header>

          {/* Experience with timeline */}
          {cv.experience.length > 0 && (
            <section className="mb-3">
              <MainSectionHeading color={accent} icon={
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a1 1 0 00-1 1v9a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              }>
                {labels.experience}
              </MainSectionHeading>

              {/* Timeline entries */}
              <div className="relative ml-[10px]">
                {/* Vertical timeline line */}
                <div
                  className="absolute left-0 top-1 bottom-0 w-px"
                  style={{ backgroundColor: timelineColor }}
                />
                {cv.experience.map((group, i) => {
                  if (group.isSingleRole) {
                    const role = group.roles[0];
                    const dateStr = formatDateRange(role.startDate, role.endDate, cv.cvLanguage);
                    const bullets = filteredBullets(role.bullets);
                    return (
                      <div key={i} className="relative pl-5 mb-2.5 break-inside-avoid">
                        <TimelineDot color={accent} filled />
                        <div>
                          <span className="font-bold text-[8.5pt] text-gray-900">{role.title}</span>
                          {group.company && (
                            <span className="text-[8.5pt] text-gray-500">
                              {" \u00A0-\u00A0 "}{group.company}
                            </span>
                          )}
                        </div>
                        <div className="text-[7.5pt] text-gray-500">
                          {dateStr}
                          {role.location && <>{dateStr ? " \u00A0\u00B7\u00A0 " : ""}{role.location}</>}
                        </div>
                        {role.description && (
                          <p className="text-[7.5pt] text-gray-700 mt-0.5 whitespace-pre-line">{role.description}</p>
                        )}
                        {bullets.length > 0 && (
                          <ul className="mt-1 space-y-0.5">
                            {bullets.map((bullet, j) => (
                              <li key={j} className="flex items-start gap-2 text-[7.5pt] text-gray-700 leading-[1.45]">
                                <span className="mt-[4px] h-[4px] w-[4px] rounded-full shrink-0" style={{ backgroundColor: timelineColor }} />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  }

                  // Multi-role group
                  const groupDateStr = formatDateRange(group.startDate, group.endDate, cv.cvLanguage);
                  return (
                    <div key={i} className="relative pl-5 mb-2.5 break-inside-avoid">
                      <TimelineDot color={accent} filled />
                      <div>
                        <span className="font-bold text-[8.5pt] text-gray-900">{group.company}</span>
                      </div>
                      <div className="text-[7.5pt] text-gray-500">
                        {groupDateStr}
                        {group.location && <>{groupDateStr ? " \u00A0\u00B7\u00A0 " : ""}{group.location}</>}
                      </div>
                      {/* Sub-roles */}
                      <div className="mt-1 ml-1 pl-2.5 space-y-1.5" style={{ borderLeft: `2px solid ${timelineColor}` }}>
                        {group.roles.map((role, j) => {
                          const roleDateStr = formatDateRange(role.startDate, role.endDate, cv.cvLanguage);
                          const bullets = filteredBullets(role.bullets);
                          return (
                            <div key={j}>
                              <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-[8pt] text-gray-800">{role.title}</span>
                                {roleDateStr && <span className="text-[7pt] text-gray-500 whitespace-nowrap ml-2">{roleDateStr}</span>}
                              </div>
                              {role.description && (
                                <p className="text-[7.5pt] text-gray-700 mt-0.5 whitespace-pre-line">{role.description}</p>
                              )}
                              {bullets.length > 0 && (
                                <ul className="mt-0.5 space-y-0.5">
                                  {bullets.map((bullet, k) => (
                                    <li key={k} className="flex items-start gap-2 text-[7.5pt] text-gray-700 leading-[1.45]">
                                      <span className="mt-[4px] h-[4px] w-[4px] rounded-full shrink-0" style={{ backgroundColor: timelineColor }} />
                                      <span>{bullet}</span>
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
                })}
              </div>
            </section>
          )}

          {/* Education with timeline */}
          {cv.education.length > 0 && (
            <section className="mb-3">
              <MainSectionHeading color={accent} icon={
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5v4.5a7 7 0 0014 0V9.5" />
                </svg>
              }>
                {labels.education}
              </MainSectionHeading>

              <div className="relative ml-[10px]">
                <div
                  className="absolute left-0 top-1 bottom-0 w-px"
                  style={{ backgroundColor: timelineColor }}
                />
                {cv.education.map((edu, i) => {
                  const dateStr = formatDateRange(edu.startDate, edu.endDate, cv.cvLanguage);
                  return (
                    <div key={i} className="relative pl-5 mb-2.5 break-inside-avoid">
                      <TimelineDot color={accent} filled />
                      <div>
                        <span className="font-bold text-[8.5pt] text-gray-900">
                          {edu.degree}{edu.field ? ` ${edu.field}` : ""}
                        </span>
                        {dateStr && <span className="text-[8pt] text-gray-500 ml-2">{dateStr}</span>}
                      </div>
                      <div className="text-[7.5pt] text-gray-500">
                        {edu.institution}
                      </div>
                      {edu.description && (
                        <p className="text-[7.5pt] text-gray-700 mt-0.5">{edu.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Extras (Certifications etc.) with timeline */}
          {cv.extras?.length > 0 && (
            <section className="mb-3">
              <MainSectionHeading color={accent} icon={
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              }>
                {labels.extras}
              </MainSectionHeading>

              <div className="relative ml-[10px]">
                <div
                  className="absolute left-0 top-1 bottom-0 w-px"
                  style={{ backgroundColor: timelineColor }}
                />
                {cv.extras.map((group, i) => (
                  <div key={i} className="mb-1.5">
                    {cv.extras.length > 1 && (
                      <div className="relative pl-5 mb-0.5">
                        <h3 className="text-[8pt] font-semibold" style={{ color: accent }}>
                          {translateExtrasCategory(group.category, cv.cvLanguage)}
                        </h3>
                      </div>
                    )}
                    {group.items.map((item, j) => (
                      <div key={j} className="relative pl-5 mb-1">
                        <TimelineDot color={accent} filled />
                        <span className="text-[7.5pt] text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          <CvFooter
            name={cv.name || labels.yourName}
            className="mt-auto"
          />
        </main>
      </div>
    </div>
  );
}
