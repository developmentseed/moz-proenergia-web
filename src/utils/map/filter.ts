import { type FilterSpecification } from "maplibre-gl";
import { type Filter} from "@/app/types";

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
          // @TODO: Convert any enum data to string
          const intValues = selectedValues.map(v => parseInt(v));
          conditions.push(["in", ["get", filterDef.column], ["literal", intValues]]);
          break;

      }
    });

    // Return combined filter or null if no conditions found.
    return conditions.length > 0 ? ["all", ...conditions] as FilterSpecification : null;
}
