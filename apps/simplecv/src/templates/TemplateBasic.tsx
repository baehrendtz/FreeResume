"use client";

import type { RenderModel } from "@/lib/fitting/types";
import type { TemplateStyleValues } from "@/lib/model/TemplateStyleSettings";
import { getCvStrings } from "@/lib/cvLocale";
import {
  scaledContainerStyle,
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
  styleSettings?: TemplateStyleValues;
}

export default function TemplateBasic({ cv, styleSettings }: TemplateProps) {
  const labels = getCvStrings(cv.cvLanguage ?? "en");
  const contactStrings = [cv.email, cv.phone, cv.location, cv.linkedIn, cv.website].filter(Boolean);

  const accent = styleSettings?.accentColor ?? "#0d9488";
  const photoSize = styleSettings?.photoSizePx ?? 64;
  const fontZoom = (styleSettings?.fontSizePercent ?? 100) / 100;
  const photoShape = styleSettings?.photoShape ?? "circle";
  const photoShapeClass =
    photoShape === "circle" ? "rounded-full" :
    photoShape === "rounded" ? "rounded-lg" : "rounded-none";
  const BASE_LINE_HEIGHT = 1.35;
  const lineHeight = BASE_LINE_HEIGHT * (styleSettings?.lineHeightPercent ?? 100) / 100;
  const lineScale = (styleSettings?.lineHeightPercent ?? 100) / 100;

  return (
    <div
      lang={cv.cvLanguage}
      className="cv-template font-sans text-[8.5pt] text-gray-800 p-6 mx-auto bg-white flex flex-col"
      style={scaledContainerStyle(fontZoom, lineHeight)}
    >
      {/* Header */}
      <header className="mb-3 pl-4" style={{ borderLeft: `4px solid ${accent}` }}>
        <div className="flex items-start gap-3">
          {cv.photo && (
            <img
              src={cv.photo}
              alt=""
              className={`${photoShapeClass} object-cover shrink-0`}
              style={{ width: photoSize, height: photoSize, borderColor: accent, borderWidth: 1, borderStyle: "solid" }}
            />
          )}
          <div className="min-w-0">
            <h1 className="text-[18pt] font-bold tracking-tight text-gray-900">{cv.name || labels.yourName}</h1>
            {cv.headline && (
              <p className="text-[9pt] font-medium mt-0.5" style={{ color: accent }}>{cv.headline}</p>
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
          <SectionTitle className="tracking-[0.12em] mb-1.5" style={{ color: accent, borderColor: accent }}>{labels.summary}</SectionTitle>
          <p className="text-[8.5pt] text-gray-700 whitespace-pre-line">{cv.summary}</p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className="tracking-[0.12em] mb-1.5" style={{ color: accent, borderColor: accent }}>{labels.experience}</SectionTitle>
          {cv.experience.map((exp, i) => (
            <ExperienceItem key={i} exp={exp} layout="title-first" cvLanguage={cv.cvLanguage} lineHeightScale={lineScale} />
          ))}
        </section>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className="tracking-[0.12em] mb-1.5" style={{ color: accent, borderColor: accent }}>{labels.education}</SectionTitle>
          {cv.education.map((edu, i) => (
            <EducationItem key={i} edu={edu} cvLanguage={cv.cvLanguage} lineHeightScale={lineScale} />
          ))}
        </section>
      )}

      {/* Skills */}
      {cv.skills.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className="tracking-[0.12em] mb-1.5" style={{ color: accent, borderColor: accent }}>{labels.skills}</SectionTitle>
          <SkillsList skills={cv.skills} variant="pills" />
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className="tracking-[0.12em] mb-1.5" style={{ color: accent, borderColor: accent }}>{labels.languages}</SectionTitle>
          <LanguagesList languages={cv.languages} variant="pills" cvLanguage={cv.cvLanguage} />
        </section>
      )}

      {/* Extras */}
      {cv.extras?.length > 0 && (
        <section className="mb-2.5">
          <SectionTitle className="tracking-[0.12em] mb-1.5" style={{ color: accent, borderColor: accent }}>{labels.extras}</SectionTitle>
          <ExtrasList
            extras={cv.extras}
            className={cv.extras.length > 1 ? "grid grid-cols-2 gap-x-4" : undefined}
            cvLanguage={cv.cvLanguage}
          />
        </section>
      )}

      <CvFooter name={cv.name || labels.yourName} accentBar accentColorHex={accent} />
    </div>
  );
}
