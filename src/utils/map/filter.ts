import { type FilterSpecification, type ExpressionSpecification } from "maplibre-gl";
import { type Filter, type Main } from "@/app/types";
import { DEFAULT_COL } from "@/utils/api";

export function buildExpressionWithFilter(filterRef: Filter[], filters: Record<string,unknown>): (FilterSpecification | null) {
  const conditions: FilterSpecification[] = [];
  Object.entries(filters).forEach(([filterId, filterValue]) => {
      const filterDef = filterRef.find(filter => filter.id === filterId);
      if (!filterDef) return;

      switch (filterDef.type) {
        case 'numeric':
          const [min, max] = filterValue as [number, number];
          conditions.push(
            ["all",
              [">=", ["get", filterDef.column], min],
              ["<=", ["get", filterDef.column], max]
            ]
          );
          break;
        case 'checkbox':
          const selectedValues = filterValue as string[];
          conditions.push(["in", ["get", filterDef.column], ["literal", selectedValues]]);
          break;
        case 'admin':
          const adminValues = filterValue as string[];
          // Skip if empty array (show everything)
          if (adminValues && adminValues.length > 0) {
            conditions.push(["in", ["get", filterDef.column], ["literal", adminValues]]);
          }
          break;
      }

    });

    // Return combined filter or null if no conditions found.
    return conditions.length > 0 ? ["all", ...conditions] as FilterSpecification : null;
}

// For cases where visualization doesn't have any options, returns DEFAULT value (pue)
export function buildMatchExpression(main: Main, fallback: string): ExpressionSpecification | string {
  if (!main.options.length) return fallback;
  return [
    'match',
    main.column === DEFAULT_COL ? ['literal', DEFAULT_COL] : ['get', main.column],
    // Color should not be empty. Giving neon green color to bring awarness to user
    ...main.options.flatMap((val) => val.color? [val.id, val.color]: [val.id, "#0f0"]),
    '#CCCCCC',
  ] as ExpressionSpecification;
}
