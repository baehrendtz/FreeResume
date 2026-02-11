"use client";

import type { RenderModel } from "@/lib/fitting/types";
import { getCvStrings } from "@/lib/cvLocale";
import {
  SectionTitle,
  CvFooter,
  ExperienceItem,
  EducationItem,
  SkillsList,
  LanguagesList,
  ExtrasList,
} from "./templateHelpers";

interface TemplateProps {
  cv: RenderModel;
}

export default function TemplateBasic({ cv }: TemplateProps) {
  const labels = getCvStrings(cv.cvLanguage ?? "en");
  const contactStrings = [cv.email, cv.phone, cv.location, cv.linkedIn, cv.website].filter(Boolean);

  const sectionTitleClass = "tracking-[0.12em] text-teal-800 border-teal-200 mb-1.5";

  return (
    <div lang={cv.cvLanguage} className="cv-template font-sans text-[8.5pt] leading-[1.35] text-gray-800 p-6 max-w-[210mm] mx-auto bg-white min-h-[297mm] flex flex-col">
      {/* Header */}
      <header className="mb-3 border-l-4 border-teal-700 pl-4">
        <div className="flex items-start gap-3">
          {cv.photo && (
            <img src={cv.photo} alt=""
              className="h-[64px] w-[64px] rounded-full object-cover border border-teal-200 shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="text-[18pt] font-bold tracking-tight text-gray-900">{cv.name || labels.yourName}</h1>
            {cv.headline && (
              <p className="text-[9pt] text-teal-700 font-medium mt-0.5">{cv.headline}</p>
            )}
            {contactStrings.length > 0 && (
              <p className="text-[7.5pt] text-gray-500 mt-1">
                {contactStrings.join(" · ")}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>{labels.summary}</SectionTitle>
          <p className="text-[8.5pt] text-gray-700 whitespace-pre-line">{cv.summary}</p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>{labels.experience}</SectionTitle>
          {cv.experience.map((exp, i) => (
            <ExperienceItem key={i} exp={exp} layout="title-first" cvLanguage={cv.cvLanguage} />
          ))}
        </section>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>{labels.education}</SectionTitle>
          {cv.education.map((edu, i) => (
            <EducationItem key={i} edu={edu} cvLanguage={cv.cvLanguage} />
          ))}
        </section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>{labels.skills}</SectionTitle>
          <SkillsList skills={cv.skills} variant="pills" />
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>{labels.languages}</SectionTitle>
          <LanguagesList languages={cv.languages} variant="pills" cvLanguage={cv.cvLanguage} />
        </section>
      )}

      {/* Extras */}
      {cv.extras?.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>{labels.extras}</SectionTitle>
          <ExtrasList
            extras={cv.extras}
            className={cv.extras.length > 1 ? "grid grid-cols-2 gap-x-4" : undefined}
            cvLanguage={cv.cvLanguage}
          />
        </section>
      )}

      <CvFooter name={cv.name || labels.yourName} accentBar accentColor="bg-teal-700" />
    </div>
  );
}
