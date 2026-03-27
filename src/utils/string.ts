/**
 * Helpers for names that carry a numeric sort prefix, e.g:
 *   "01_Access & Coverage"
 *   "1CategoryName"
 *   "4-Infrastructure Needs"
 *
 * parseSortPrefix  — extracts the leading number for ordering (no prefix → Infinity)
 * stripSortPrefix  — removes everything before the first alphabetical character
 */

export function parseSortPrefix(name: string): number {
  const match = name.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

export function stripSortPrefix(name: string): string {
  return name.replace(/^\d+[^a-zA-Z]*/, "");
}
