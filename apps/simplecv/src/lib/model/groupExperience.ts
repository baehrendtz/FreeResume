import type { Experience } from "@/lib/model/CvModel";

/**
 * Assign companyGroupId to consecutive entries with the same company name.
 * Entries that already have a companyGroupId are left unchanged.
 */
export function assignCompanyGroupIds(entries: Experience[]): Experience[] {
  let lastGroupId = crypto.randomUUID();
  return entries.map((entry, i) => {
    if (entry.companyGroupId) {
      lastGroupId = entry.companyGroupId;
      return entry;
    }
    if (i > 0 && entry.company === entries[i - 1].company && entry.company) {
      return { ...entry, companyGroupId: lastGroupId };
    }
    lastGroupId = crypto.randomUUID();
    return { ...entry, companyGroupId: lastGroupId };
  });
}

/**
 * Indices of experience entries that fall outside the first `maxGroups`
 * company groups. Mirrors how buildRenderModel groups consecutive visible
 * entries by companyGroupId before slicing. Hidden entries are skipped.
 */
export function resolveExcludedExperience(entries: Experience[], maxGroups: number): Set<number> {
  const excluded = new Set<number>();
  let groupCount = 0;
  let currentGroupId: string | null = null;
  entries.forEach((entry, i) => {
    if (entry.hidden) return;
    if (groupCount === 0 || entry.companyGroupId !== currentGroupId) {
      groupCount += 1;
      currentGroupId = entry.companyGroupId ?? null;
    }
    if (groupCount > maxGroups) excluded.add(i);
  });
  return excluded;
}
