"use client";

import type { CvModel } from "@/lib/model/CvModel";
import {
  getContactItems,
  SectionTitle,
  CvFooter,
  ExperienceItem,
  EducationItem,
  SkillsList,
  LanguagesList,
  ExtrasList,
} from "./templateHelpers";

interface TemplateProps {
  cv: CvModel;
}

export default function TemplateProfessional({ cv }: TemplateProps) {
  const contactItems = getContactItems(cv);

  const sidebarTitleClass = "tracking-[0.15em] text-gray-700 border-gray-300";
  const mainTitleClass = "tracking-[0.12em] text-gray-700 border-gray-200 mb-1.5";

  return (
    <div className="cv-template cv-template-professional font-sans text-[8pt] leading-[1.25] text-gray-900 max-w-[210mm] mx-auto bg-white min-h-[297mm] flex flex-col">
      {/* Dark header with subtle gradient */}
      <header className="text-white px-6 py-3.5" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
        <div className="flex items-start gap-4">
          {cv.photo && (
            <img
              src={cv.photo}
              alt=""
              className="h-[72px] w-[72px] rounded-full object-cover border-2 border-white/20 shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-[18pt] font-bold tracking-tight leading-tight">
              {cv.name ? cv.name.toUpperCase() : "YOUR NAME"}
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
        <div className="absolute left-0 top-0 bottom-0 w-[27%] bg-gray-100" />

        {/* Sidebar */}
        <aside className="w-[27%] shrink-0 relative px-3.5 py-3 space-y-3">
          {/* Contact */}
          {contactItems.length > 0 && (
            <div>
              <SectionTitle className={sidebarTitleClass}>Contact</SectionTitle>
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
              <SectionTitle className={sidebarTitleClass}>Skills</SectionTitle>
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
              <SectionTitle className={sidebarTitleClass}>Languages</SectionTitle>
              <LanguagesList languages={cv.languages} variant="bullets" />
            </div>
          )}

          {/* Extras */}
          {cv.extras?.length > 0 && (
            <div>
              <SectionTitle className={sidebarTitleClass}>Extras</SectionTitle>
              <ExtrasList
                extras={cv.extras}
                categoryClassName="text-[7pt] font-semibold text-gray-600 mb-0.5 capitalize"
                itemClassName="text-[7.5pt] text-gray-700"
              />
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-3 space-y-2 min-w-0">
          {/* Experience */}
          {cv.experience.length > 0 && (
            <section>
              <SectionTitle className={mainTitleClass}>Professional Experience</SectionTitle>
              {cv.experience.map((exp, i) => (
                <ExperienceItem
                  key={i}
                  exp={exp}
                  layout="company-first"
                  titleClassName="font-bold text-[8.5pt] text-gray-900"
                  dateClassName="text-[7pt] text-gray-500 whitespace-nowrap ml-4 tabular-nums"
                  bulletClassName="text-[7.5pt] text-gray-700"
                />
              ))}
            </section>
          )}

          {/* Education */}
          {cv.education.length > 0 && (
            <section>
              <SectionTitle className={mainTitleClass}>Education</SectionTitle>
              {cv.education.map((edu, i) => (
                <EducationItem
                  key={i}
                  edu={edu}
                  institutionClassName="font-bold text-[8.5pt] text-gray-900"
                  dateClassName="text-[7pt] text-gray-500 whitespace-nowrap ml-4 tabular-nums"
                  degreeClassName="text-[7.5pt] text-gray-600"
                />
              ))}
            </section>
          )}
        </main>
      </div>

      <CvFooter
        name={cv.name ? cv.name.toUpperCase() : "YOUR NAME"}
        className="px-5"
        accentBar
        accentColor="bg-gray-900"
      />
    </div>
  );
}
