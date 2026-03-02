import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { buildFilterQueryParam } from "@/utils/query-string-builder";
import { transformFieldSummary } from "@/utils/summary";
import { type Field, type Filter } from "@/app/types";
import { type SummaryRow } from "@/app/types/summary";

interface UseSummaryQueryOptions {
  scenarioId: string;
  summaryFields: Field[];
  filters?: Record<string, [number, number] | string[] | null>;
  filterDefs?: Filter[];
  enabled?: boolean;
}

export function useSummaryQuery({
  scenarioId,
  summaryFields,
  filters,
  filterDefs,
  enabled = true,
}: UseSummaryQueryOptions) {
  const allColumns = summaryFields.flatMap((f) => f.columns);
  const groupBy = summaryFields.find((f) => f.group_by)?.group_by;

  return useQuery({
    queryKey: ["summaries", scenarioId, allColumns, groupBy, filters ?? {}],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = {
        fields: allColumns.join(","),
      };
      if (filters && filterDefs) {
        const q = buildFilterQueryParam(filters, filterDefs);
        if (q) params.q = q;
      }
      if (groupBy) params.group_by = groupBy;

      const { data } = await api.get(
        `scenario/${scenarioId}/summaries/`,
        { signal, params },
      );

      const rows: SummaryRow[] = summaryFields.map((field) => {
        try {
          return transformFieldSummary(data, field);
        } catch {
          return {
            type: "error" as const,
            label: field.label,
            key: field.columns[0],
          };
        }
      });

      return rows.sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === "flat" || a.type === "error" ? -1 : 1;
      });
    },
    retry: false,
    enabled: enabled && allColumns.length > 0,
  });
}
