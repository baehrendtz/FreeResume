import type { Experience } from "@/lib/model/CvModel";

/**
 * Assign companyGroupId to consecutive entries with the same company name.
 * Entries that already have a companyGroupId are left unchanged.
 */
export function assignCompanyGroupIds(entries: Experience[]): Experience[] {
  let currentGroupId = crypto.randomUUID();
  return entries.map((entry, i) => {
    if (entry.companyGroupId) return entry;
    if (i > 0 && entry.company === entries[i - 1].company && entry.company) {
      return { ...entry, companyGroupId: entries[i - 1].companyGroupId ?? currentGroupId };
    }
    currentGroupId = crypto.randomUUID();
    return { ...entry, companyGroupId: currentGroupId };
  });
}
