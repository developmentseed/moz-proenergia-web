const DEGREE_ORDER: Record<string, number> = {
  'very high': 0,
  'high': 1,
  'medium': 2,
  'low': 3,
  'very low': 4,
};

export function sortFilterOptions(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const aRank = DEGREE_ORDER[a.toLowerCase()];
    const bRank = DEGREE_ORDER[b.toLowerCase()];
    // Both are degree-based: sort by rank
    if (aRank !== undefined && bRank !== undefined) return aRank - bRank;
    // Degree-based keys come first
    if (aRank !== undefined) return -1;
    if (bRank !== undefined) return 1;
    // Neither is degree-based: keep original order
    return 0;
  });
}
