import { z } from "zod/v4";

export const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  bullets: z.array(z.string()),
  hidden: z.boolean().optional(),
});

export const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  hidden: z.boolean().optional(),
});

export const extrasGroupSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});
export type ExtrasGroup = z.infer<typeof extrasGroupSchema>;

export const sectionsVisibilitySchema = z.object({
  summary: z.boolean(),
  experience: z.boolean(),
  education: z.boolean(),
  skills: z.boolean(),
  languages: z.boolean(),
  extras: z.boolean(),
});

export const cvModelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  linkedIn: z.string(),
  website: z.string(),
  photo: z.string(),
  summary: z.string(),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
  extras: z.array(extrasGroupSchema),
  sectionsVisibility: sectionsVisibilitySchema,
});

export type CvModel = z.infer<typeof cvModelSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type SectionsVisibility = z.infer<typeof sectionsVisibilitySchema>;

export function createEmptyCvModel(): CvModel {
  return {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedIn: "",
    website: "",
    photo: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
    extras: [],
    sectionsVisibility: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      languages: true,
      extras: true,
    },
  };
}
