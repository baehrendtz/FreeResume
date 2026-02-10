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

export default function TemplateBasic({ cv }: TemplateProps) {
  const contactItems = getContactItems(cv);
  const contactStrings = [cv.email, cv.phone, cv.location, cv.linkedIn, cv.website].filter(Boolean);

  const sectionTitleClass = "tracking-[0.12em] text-teal-800 border-teal-200 mb-1.5";

  return (
    <div className="cv-template font-sans text-[8.5pt] leading-[1.35] text-gray-800 p-6 max-w-[210mm] mx-auto bg-white min-h-[297mm] flex flex-col">
      {/* Header */}
      <header className="mb-3 border-l-4 border-teal-700 pl-4">
        <h1 className="text-[18pt] font-bold tracking-tight text-gray-900">{cv.name || "Your Name"}</h1>
        {cv.headline && (
          <p className="text-[9pt] text-teal-700 font-medium mt-0.5">{cv.headline}</p>
        )}
        {contactStrings.length > 0 && (
          <p className="text-[7.5pt] text-gray-500 mt-1">
            {contactStrings.join(" · ")}
          </p>
        )}
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>Summary</SectionTitle>
          <p className="text-[8.5pt] text-gray-700 whitespace-pre-line">{cv.summary}</p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>Experience</SectionTitle>
          {cv.experience.map((exp, i) => (
            <ExperienceItem key={i} exp={exp} layout="title-first" />
          ))}
        </section>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>Education</SectionTitle>
          {cv.education.map((edu, i) => (
            <EducationItem key={i} edu={edu} />
          ))}
        </section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>Skills</SectionTitle>
          <SkillsList skills={cv.skills} variant="pills" />
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>Languages</SectionTitle>
          <LanguagesList languages={cv.languages} variant="pills" />
        </section>
      )}

      {/* Extras */}
      {cv.extras?.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className={sectionTitleClass}>Extras</SectionTitle>
          <ExtrasList extras={cv.extras} />
        </section>
      )}

      <CvFooter name={cv.name || "Your Name"} accentBar accentColor="bg-teal-700" />
    </div>
  );
}
