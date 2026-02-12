"use client";

import type { RenderModel } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getCvStrings } from "@/lib/cvLocale";
import { Briefcase, GraduationCap, Code, Globe, Star } from "lucide-react";
import {
  scaledContainerStyle,
  getContactItems,
  SectionTitle,
  ExperienceItem,
  EducationItem,
  SkillsList,
  LanguagesList,
  ExtrasList,
} from "./templateHelpers";

interface TemplateProps {
  cv: RenderModel;
  styleSettings?: TemplateStyleValues;
}

const DEFAULT_ACCENT2 = "#8b5cf6"; // violet-500

export default function TemplateCreative({ cv, styleSettings }: TemplateProps) {
  const cvLabels = getCvStrings(cv.cvLanguage ?? "en");
  const contactItems = getContactItems(cv);

  const ACCENT = styleSettings?.accentColor ?? "#06b6d4";
  const ACCENT2 = styleSettings?.secondaryColor ?? DEFAULT_ACCENT2;
  const photoSize = styleSettings?.photoSizePx ?? 64;
  const fontZoom = (styleSettings?.fontSizePercent ?? 100) / 100;
  const photoShape = styleSettings?.photoShape ?? "circle";
  const photoShapeClass =
    photoShape === "circle" ? "rounded-full" :
    photoShape === "rounded" ? "rounded-lg" : "rounded-none";
  const SIDEBAR_BG = styleSettings?.sidebarBgColor ?? "#f8fafc";
  const HEADER_BG = "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)";
  const GRADIENT_BAR = `linear-gradient(to right, ${ACCENT}, ${ACCENT2})`;
  const BASE_LINE_HEIGHT = 1.3;
  const lineHeight = BASE_LINE_HEIGHT * (styleSettings?.lineHeightPercent ?? 100) / 100;
  const lineScale = (styleSettings?.lineHeightPercent ?? 100) / 100;

  return (
    <div lang={cv.cvLanguage} className="cv-template font-sans text-[8pt] text-gray-800 mx-auto bg-white flex flex-col relative" style={scaledContainerStyle(fontZoom, lineHeight)}>
      {/* Top accent gradient bar */}
      <div style={{ height: 3, background: GRADIENT_BAR }} />

      {/* Header — gradient dark strip */}
      <header className="px-7 pt-5 pb-3" style={{ background: HEADER_BG }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[18pt] font-bold tracking-tight text-white">
              {cv.name || cvLabels.yourName}
            </h1>
            {cv.headline && (
              <p className="text-[9pt] font-medium mt-0.5" style={{ color: ACCENT }}>
                {cv.headline}
              </p>
            )}
          </div>
          {cv.photo && (
            <div
              className={`${photoShapeClass} shrink-0 flex items-center justify-center`}
              style={{ width: photoSize + 4, height: photoSize + 4, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, padding: 2 }}
            >
              <img
                src={cv.photo}
                alt=""
                className={`${photoShapeClass} object-cover`}
                style={{ width: photoSize, height: photoSize }}
              />
            </div>
          )}
        </div>

        {cv.summary && (
          <p className="text-[7.5pt] leading-[1.45] mt-2 whitespace-pre-line" style={{ color: "#94a3b8" }}>
            {cv.summary}
          </p>
        )}

        {contactItems.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {contactItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1 text-[7pt] font-mono" style={{ color: "#e2e8f0" }}>
                <span style={{ color: `${ACCENT}99` }}>{item.icon}</span>
                {item.value}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Two-column body */}
      <div className="flex flex-1 relative">
        {/* Sidebar background — absolute div for html2canvas compatibility */}
        <div className="absolute left-0 top-0 bottom-0 w-[28%]" style={{ backgroundColor: SIDEBAR_BG }} />

        {/* Left sidebar */}
        <aside className="w-[28%] shrink-0 relative px-4 py-3 space-y-3">
          {cv.skills.length > 0 && (
            <div style={{ borderLeft: `2px solid ${ACCENT}`, paddingLeft: 8 }}>
              <SectionTitle className="font-mono text-[7pt] tracking-[0.15em] text-gray-500 border-0 pb-0 mb-1.5">
                <span className="flex items-center gap-1">
                  <Code style={{ width: 10, height: 10, color: ACCENT }} />
                  <span><span style={{ color: ACCENT }}>{"//"}</span> {cvLabels.skills}</span>
                </span>
              </SectionTitle>
              <SkillsList
                skills={cv.skills}
                variant="pills"
                className="gap-1"
                pillClassName={`font-mono px-2 py-0.5 text-[6.5pt] rounded-full border`}
                pillStyle={{ backgroundColor: `${ACCENT}15`, color: `${ACCENT}dd`, borderColor: `${ACCENT}40` }}
              />
            </div>
          )}

          {cv.languages.length > 0 && (
            <div style={{ borderLeft: `2px solid ${ACCENT2}`, paddingLeft: 8 }}>
              <SectionTitle className="font-mono text-[7pt] tracking-[0.15em] text-gray-500 border-0 pb-0 mb-1.5">
                <span className="flex items-center gap-1">
                  <Globe style={{ width: 10, height: 10, color: ACCENT2 }} />
                  <span><span style={{ color: ACCENT2 }}>{"//"}</span> {cvLabels.languages}</span>
                </span>
              </SectionTitle>
              <LanguagesList
                languages={cv.languages}
                variant="pills"
                cvLanguage={cv.cvLanguage}
                pillClassName={`font-mono px-2 py-0.5 text-[6.5pt] rounded-full border`}
                pillStyle={{ backgroundColor: `${ACCENT2}15`, color: `${ACCENT2}dd`, borderColor: `${ACCENT2}40` }}
              />
            </div>
          )}

          {cv.extras?.length > 0 && (
            <div style={{ borderLeft: "2px solid #f59e0b", paddingLeft: 8 }}>
              <SectionTitle className="font-mono text-[7pt] tracking-[0.15em] text-gray-500 border-0 pb-0 mb-1.5">
                <span className="flex items-center gap-1">
                  <Star style={{ width: 10, height: 10, color: "#f59e0b" }} />
                  <span><span style={{ color: "#f59e0b" }}>{"//"}</span> {cvLabels.extras}</span>
                </span>
              </SectionTitle>
              <ExtrasList
                extras={cv.extras}
                categoryClassName="font-mono text-[6.5pt] font-semibold text-gray-500 mb-0.5"
                itemClassName="text-[7pt] text-gray-600"
                cvLanguage={cv.cvLanguage}
              />
            </div>
          )}
        </aside>

        {/* Right main content */}
        <main className="flex-1 px-5 py-3 space-y-2.5 min-w-0">
          {cv.experience.length > 0 && (
            <section>
              <div className="mb-1.5">
                <SectionTitle className="font-mono text-[8pt] font-bold tracking-[0.12em] text-gray-700 border-0 pb-0 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Briefcase style={{ width: 12, height: 12, color: ACCENT }} />
                    {cvLabels.experience}
                  </span>
                </SectionTitle>
                <div className="h-[1.5px]" style={{ background: GRADIENT_BAR }} />
              </div>
              {cv.experience.map((exp, i) => (
                <div key={i} className="flex gap-2.5">
                  {/* Timeline: ring-dot + vertical line */}
                  <div className="flex flex-col items-center shrink-0 pt-[4px]" style={{ width: 12 }}>
                    <div
                      className="rounded-full shrink-0 flex items-center justify-center"
                      style={{ width: 7, height: 7, backgroundColor: ACCENT }}
                    >
                      <div className="rounded-full" style={{ width: 3, height: 3, backgroundColor: "#ffffff" }} />
                    </div>
                    {i < cv.experience.length - 1 && (
                      <div
                        className="flex-1 mt-0.5"
                        style={{ width: 1.5, background: `linear-gradient(to bottom, ${ACCENT}, #e2e8f0)` }}
                      />
                    )}
                  </div>
                  {/* Entry content */}
                  <div className="flex-1 min-w-0">
                    <ExperienceItem
                      exp={exp}
                      layout="company-first"
                      titleClassName="font-semibold text-[8.5pt] text-gray-800"
                      dateClassName="font-mono text-[7pt] text-gray-400 whitespace-nowrap ml-4 tabular-nums"
                      companyClassName="text-[7.5pt]"
                      bulletClassName="text-[7.5pt] text-gray-600"
                      cvLanguage={cv.cvLanguage}
                      lineHeightScale={lineScale}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}

          {cv.education.length > 0 && (
            <section>
              <div className="mb-1.5">
                <SectionTitle className="font-mono text-[8pt] font-bold tracking-[0.12em] text-gray-700 border-0 pb-0 mb-1">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap style={{ width: 12, height: 12, color: ACCENT2 }} />
                    {cvLabels.education}
                  </span>
                </SectionTitle>
                <div className="h-[1.5px]" style={{ background: GRADIENT_BAR }} />
              </div>
              {cv.education.map((edu, i) => (
                <div key={i} className="flex gap-2.5">
                  {/* Ring-dot marker in violet */}
                  <div className="flex flex-col items-center shrink-0 pt-[4px]" style={{ width: 12 }}>
                    <div
                      className="rounded-full shrink-0 flex items-center justify-center"
                      style={{ width: 7, height: 7, backgroundColor: ACCENT2 }}
                    >
                      <div className="rounded-full" style={{ width: 3, height: 3, backgroundColor: "#ffffff" }} />
                    </div>
                  </div>
                  {/* Entry content */}
                  <div className="flex-1 min-w-0">
                    <EducationItem
                      edu={edu}
                      institutionClassName="font-semibold text-[8.5pt] text-gray-800"
                      dateClassName="font-mono text-[7pt] text-gray-400 whitespace-nowrap ml-4 tabular-nums"
                      degreeClassName="text-[7.5pt] text-gray-500"
                      cvLanguage={cv.cvLanguage}
                      lineHeightScale={lineScale}
                    />
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>

      {/* Footer with gradient accent bar */}
      <footer className="mt-auto font-mono px-7">
        <div style={{ height: 6, background: GRADIENT_BAR }} />
        <div className="flex justify-between pt-1.5 pb-2 text-[8pt] text-gray-500">
          <span className="font-medium">{cv.name || cvLabels.yourName}</span>
        </div>
      </footer>
    </div>
  );
}
