import type { CvModel } from "@/lib/model/CvModel";
import { HEADLINE_MAX_CHARS } from "@/lib/constants";

export type CvIssueId =
  | "missingName"
  | "missingEmail"
  | "invalidEmail"
  | "missingPhone"
  | "longHeadline"
  | "missingSummary"
  | "noExperience"
  | "jobsWithoutDetails";

export interface CvIssue {
  id: CvIssueId;
  /** Wizard step where the issue can be fixed. */
  step: string;
  count?: number;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Quick quality checks shown before download. Pure, so it's cheap to run on click. */
export function checkCv(cv: CvModel): CvIssue[] {
  const issues: CvIssue[] = [];
  const vis = cv.sectionsVisibility;
  const email = cv.email.trim();

  if (!cv.name.trim()) issues.push({ id: "missingName", step: "basics" });
  if (!email) issues.push({ id: "missingEmail", step: "basics" });
  else if (!EMAIL_PATTERN.test(email)) issues.push({ id: "invalidEmail", step: "basics" });
  if (!cv.phone.trim()) issues.push({ id: "missingPhone", step: "basics" });
  if (cv.headline.length > HEADLINE_MAX_CHARS) issues.push({ id: "longHeadline", step: "basics" });
  if (vis.summary && !cv.summary.trim()) issues.push({ id: "missingSummary", step: "summary" });

  if (vis.experience) {
    const visible = cv.experience.filter((e) => !e.hidden);
    if (visible.length === 0) issues.push({ id: "noExperience", step: "experience" });
    const withoutDetails = visible.filter(
      (e) => !e.description.trim() && !e.bullets.some((b) => b.trim()),
    ).length;
    if (withoutDetails > 0) {
      issues.push({ id: "jobsWithoutDetails", step: "experience", count: withoutDetails });
    }
  }

  return issues;
}
