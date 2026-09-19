import { type CvModel, createEmptyCvModel } from "@/lib/model/CvModel";

/** Template the example is shown with, on the start screen and when opened as a CV. */
export const SAMPLE_TEMPLATE_ID = "professional";

/** Example CV shown on the start screen, so people see the result before uploading anything. */
export function createSampleCv(locale: string): CvModel {
  const sv = locale === "sv";
  return {
    ...createEmptyCvModel(),
    name: "Anna Lindqvist",
    headline: sv ? "Projektledare inom digital utveckling" : "Project Manager, Digital Products",
    email: sv ? "anna.lindqvist@exempel.se" : "anna.lindqvist@example.com",
    phone: "+46 70 123 45 67",
    location: sv ? "Göteborg, Sverige" : "Gothenburg, Sweden",
    linkedIn: "linkedin.com/in/annalindqvist",
    summary: sv
      ? "Projektledare med tio års erfarenhet av att ta digitala tjänster från idé till lansering. Jag får team och intressenter att dra åt samma håll."
      : "Project manager with ten years of experience taking digital services from idea to launch. I help teams and stakeholders pull in the same direction.",
    experience: [
      {
        title: sv ? "Projektledare" : "Project Manager",
        company: "Nordljus Digital",
        location: sv ? "Göteborg" : "Gothenburg",
        startDate: "Mar 2021",
        endDate: "Present",
        description: "",
        bullets: sv
          ? [
              "Ledde lanseringen av en kundapp med 200 000 användare första året",
              "Kortade leveranstiden med 30 % genom att införa Scrum i fyra team",
              "Ansvarade för en projektbudget på 12 miljoner kronor",
            ]
          : [
              "Led the launch of a customer app with 200,000 users in its first year",
              "Cut delivery time by 30% by introducing Scrum across four teams",
              "Owned a project budget of SEK 12 million",
            ],
        companyGroupId: "sample-1",
      },
      {
        title: sv ? "Produktägare" : "Product Owner",
        company: "Havsbanken",
        location: sv ? "Göteborg" : "Gothenburg",
        startDate: "Aug 2017",
        endDate: "Feb 2021",
        description: "",
        bullets: sv
          ? ["Byggde upp och prioriterade backloggen för mobilbanken", "Höjde kundnöjdheten (NPS) från 21 till 38"]
          : ["Built and prioritised the backlog for the mobile bank", "Raised customer satisfaction (NPS) from 21 to 38"],
        companyGroupId: "sample-2",
      },
      {
        title: sv ? "Affärsanalytiker" : "Business Analyst",
        company: "Västkust Logistik",
        location: "Borås",
        startDate: "Jun 2014",
        endDate: "Jul 2017",
        description: "",
        bullets: sv
          ? ["Tog fram beslutsunderlag som sparade 4 miljoner kronor per år i transportkostnader"]
          : ["Built decision support that saved SEK 4 million a year in transport costs"],
        companyGroupId: "sample-3",
      },
      {
        title: sv ? "Kundtjänstmedarbetare" : "Customer Service Representative",
        company: "Västkust Logistik",
        location: "Borås",
        startDate: "Sep 2012",
        endDate: "May 2014",
        description: sv
          ? "Hanterade kundärenden via telefon och mejl för företagets största kunder."
          : "Handled customer cases by phone and email for the company's largest accounts.",
        bullets: [],
        companyGroupId: "sample-4",
      },
    ],
    education: [
      {
        institution: sv ? "Göteborgs universitet" : "University of Gothenburg",
        degree: sv ? "Masterexamen" : "Master's degree",
        field: sv ? "Informatik" : "Informatics",
        startDate: "2012",
        endDate: "2014",
        description: "",
      },
      {
        institution: sv ? "Högskolan i Borås" : "University of Borås",
        degree: sv ? "Kandidatexamen" : "Bachelor's degree",
        field: sv ? "Systemvetenskap" : "Information Systems",
        startDate: "2009",
        endDate: "2012",
        description: "",
      },
    ],
    extras: [
      { category: "certifications", items: ["PMP", "Professional Scrum Master I"] },
    ],
    skills: sv
      ? ["Projektledning", "Scrum", "Kravanalys", "Intressenthantering", "Budget", "Jira"]
      : ["Project management", "Scrum", "Requirements analysis", "Stakeholder management", "Budgeting", "Jira"],
    languages: [
      { name: "sv", level: "native" },
      { name: "en", level: "full_professional" },
    ],
  };
}
