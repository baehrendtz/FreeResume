"use client";

import type { RenderModel } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getCvStrings } from "@/lib/cvLocale";
import {
  scaledContainerStyle,
  getContactItems,
  SectionTitle,
  CvFooter,
  ExperienceGroupItem,
  EducationItem,
  SkillsList,
  LanguagesList,
  ExtrasList,
} from "./templateHelpers";

interface TemplateProps {
  cv: RenderModel;
  styleSettings?: TemplateStyleValues;
}

export default function TemplateProfessional({ cv, styleSettings }: TemplateProps) {
  const labels = getCvStrings(cv.cvLanguage ?? "en");
  const contactItems = getContactItems(cv);

  const accent = styleSettings?.accentColor ?? "#1a1a2e";
  const photoSize = styleSettings?.photoSizePx ?? 80;
  const fontZoom = (styleSettings?.fontSizePercent ?? 100) / 100;
  const photoShape = styleSettings?.photoShape ?? "circle";
  const photoShapeClass =
    photoShape === "circle" ? "rounded-full" :
    photoShape === "rounded" ? "rounded-lg" : "rounded-none";
  const sidebarBg = styleSettings?.sidebarBgColor ?? "#f1f5f9";
  const BASE_LINE_HEIGHT = 1.25;
  const lineHeight = BASE_LINE_HEIGHT * (styleSettings?.lineHeightPercent ?? 100) / 100;
  const lineScale = (styleSettings?.lineHeightPercent ?? 100) / 100;

  const sidebarTitleClass = "tracking-[0.15em] text-gray-700 border-gray-300";
  const mainTitleClass = "tracking-[0.12em] text-gray-700 border-gray-200 mb-1.5";

  // Build a gradient from the accent color for the header
  const headerBg = `linear-gradient(135deg, ${accent} 0%, ${accent}dd 50%, ${accent}bb 100%)`;

  return (
    <div
      lang={cv.cvLanguage}
      className="cv-template cv-template-professional font-sans text-[8pt] text-gray-900 mx-auto bg-white flex flex-col"
      style={scaledContainerStyle(fontZoom, lineHeight)}
    >
      {/* Dark header with subtle gradient */}
      <header className="text-white px-6 py-3.5" style={{ background: headerBg }}>
        <div className="flex items-start gap-4">
          {cv.photo && (
            <img
              src={cv.photo}
              alt=""
              className={`${photoShapeClass} object-cover border-2 border-white/20 shrink-0`}
              style={{ width: photoSize, height: photoSize }}
            />
          )}
          <div className="min-w-0">
            <h1 className="text-[18pt] font-bold tracking-tight leading-tight">
              {(cv.name || labels.yourName).toUpperCase()}
            </h1>
            {cv.headline && (
              <p className="text-[9pt] font-light tracking-wide text-gray-300 mt-0.5">{cv.headline}</p>
            )}
            {cv.summary && (
              <p className="text-[7.5pt] text-gray-400 mt-1.5 leading-[1.45] whitespace-pre-line">
                {cv.summary}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Two-column body with full-height sidebar background */}
      <div className="flex flex-1 relative">
        {/* Sidebar background — absolute div for html2canvas compatibility */}
        <div className="absolute left-0 top-0 bottom-0 w-[27%]" style={{ backgroundColor: sidebarBg }} />

        {/* Sidebar */}
        <aside className="w-[27%] shrink-0 relative px-3.5 py-3 space-y-3">
          {/* Contact */}
          {contactItems.length > 0 && (
            <div>
              <SectionTitle className={sidebarTitleClass}>{labels.contact}</SectionTitle>
              <ul className="space-y-1 text-[7pt] text-gray-700">
                {contactItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="shrink-0 text-gray-400">{item.icon}</span>
                    <span className="break-all">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {cv.skills.length > 0 && (
            <div>
              <SectionTitle className={sidebarTitleClass}>{labels.skills}</SectionTitle>
              <SkillsList
                skills={cv.skills}
                variant="pills"
                className="gap-1.5"
                pillClassName="px-1.5 py-px bg-gray-200 border border-gray-300 text-gray-700 text-[6.5pt] rounded-full font-medium"
              />
            </div>
          )}

          {/* Languages */}
          {cv.languages.length > 0 && (
            <div>
              <SectionTitle className={sidebarTitleClass}>{labels.languages}</SectionTitle>
              <LanguagesList languages={cv.languages} variant="bullets" cvLanguage={cv.cvLanguage} />
            </div>
          )}

          {/* Extras */}
          {cv.extras?.length > 0 && (
            <div>
              <SectionTitle className={sidebarTitleClass}>{labels.extras}</SectionTitle>
              <ExtrasList
                extras={cv.extras}
                categoryClassName="text-[7pt] font-semibold text-gray-600 mb-0.5"
                itemClassName="text-[7.5pt] text-gray-700"
                cvLanguage={cv.cvLanguage}
              />
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-3 space-y-2 min-w-0">
          {/* Experience */}
          {cv.experience.length > 0 && (
            <section>
              <SectionTitle className={mainTitleClass}>{labels.professionalExperience}</SectionTitle>
              {cv.experience.map((group, i) => (
                <ExperienceGroupItem
                  key={i}
                  group={group}
                  layout="company-first"
                  titleClassName="font-bold text-[8.5pt] text-gray-900"
                  dateClassName="text-[7pt] text-gray-500 whitespace-nowrap ml-4 tabular-nums"
                  bulletClassName="text-[7.5pt] text-gray-700"
                  cvLanguage={cv.cvLanguage}
                  lineHeightScale={lineScale}
                  accentColor={accent}
                />
              ))}
            </section>
          )}

          {/* Education */}
          {cv.education.length > 0 && (
            <section>
              <SectionTitle className={mainTitleClass}>{labels.education}</SectionTitle>
              {cv.education.map((edu, i) => (
                <EducationItem
                  key={i}
                  edu={edu}
                  institutionClassName="font-bold text-[8.5pt] text-gray-900"
                  dateClassName="text-[7pt] text-gray-500 whitespace-nowrap ml-4 tabular-nums"
                  degreeClassName="text-[7.5pt] text-gray-600"
                  cvLanguage={cv.cvLanguage}
                  lineHeightScale={lineScale}
                />
              ))}
            </section>
          )}
        </main>
      </div>

      <CvFooter
        name={(cv.name || labels.yourName).toUpperCase()}
        className="px-5"
        accentBar
        accentColorHex={accent}
      />
    </div>
  );
}
