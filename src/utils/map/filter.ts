import { type FilterSpecification } from "maplibre-gl";
import { type Filter } from "@/app/types";

export function buildExpressionWithFilter(filterRef: Filter[], filters: Record<string,unknown>): (FilterSpecification | null) {
  const conditions: FilterSpecification[] = [];
  Object.entries(filters).forEach(([filterId, filterValue]) => {
      const filterDef = filterRef.find(filter => filter.id === filterId);
      if (!filterDef) return;

      // @TODO: Skip ElecStart column  - this is enum but being passed as number
      // Not sure why it won't work though but commenting out for now.
      if (filterDef.column === 'ElecStart') {
        return;
      }

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
