import { type Filter } from "@/app/types";

export function buildFilterQueryParam(
  filters: Record<string, [number, number] | string[] | null>,
  filterDefs: Filter[],
): string {
  const queryParts: string[] = [];

  // Build ID to column lookup
  const idToColumn = new Map(filterDefs.map((f) => [f.id, f.column]));

  for (const [filterId, value] of Object.entries(filters)) {
    if (value === null) continue;

    // Map filter ID to column name
    const column = idToColumn.get(filterId) ?? filterId;

    if (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      // Numeric filter: [min, max]
      queryParts.push(`${column}__min=${value[0]}`);
      queryParts.push(`${column}__max=${value[1]}`);
    } else if (Array.isArray(value) && value.length > 0) {
      // String array filter: join with semicolon when length is > 1
      if (value.length === 1) queryParts.push(`${column}=${value}`);
      else queryParts.push(`${column}__in=${value.join(";")}`);
    }
  }

  return queryParts.join(",");
}
