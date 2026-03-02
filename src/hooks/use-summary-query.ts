import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { buildFilterQueryParam } from "@/utils/query-string-builder";
import { transformFieldSummary } from "@/utils/summary";
import { type Field, type Filter } from "@/app/types";
import { type SummaryRow, type SummaryData } from "@/app/types/summary";

interface UseSummaryQueryOptions {
  scenarioId: string;
  summaryFields: Field[];
  filters?: Record<string, [number, number] | string[] | null>;
  filterDefs?: Filter[];
  enabled?: boolean;
}

function transformRows(fields: Field[], data: unknown): SummaryRow[] {
  return fields.map((field) => {
    try {
      return transformFieldSummary(data as any, field);
    } catch {
      return {
        type: "error" as const,
        label: field.label,
        key: field.columns[0],
      };
    }
  });
}

function sortRows(rows: SummaryRow[]): SummaryData {
  return rows.sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === "flat" || a.type === "error" ? -1 : 1;
  });
}

// This hook assumes that one scenario has consistent group_by
// Group no group_by summaryFields and multiple(two) group_by summary fields separately
// merge them and return the whole data as each summary row

export function useSummaryQuery({
  scenarioId,
  summaryFields,
  filters,
  filterDefs,
  enabled = true,
}: UseSummaryQueryOptions) {
  // Split fields: 0-1 group_by → standard query, 2 group_by → separate query
  const { standard, multiGroup } = useMemo(() => {
    const standard: Field[] = [];
    const multiGroup: Field[] = [];
    for (const f of summaryFields) {
      if (f.group_by && typeof f.group_by !== 'string' && f.group_by.length > 1) {
        multiGroup.push(f);
      } else {
        standard.push(f);
      }
    }
    return { standard, multiGroup };
  }, [summaryFields]);

  const standardColumns = standard.flatMap((f) => f.columns);
  const standardGroupBy = [...new Set(standard.flatMap((f) => f.group_by ?? []))];

  const multiGroupColumns = multiGroup.flatMap((f) => f.columns);
  const multiGroupBy = [...new Set(multiGroup.flatMap((f) => f.group_by ?? []))];

  const filterQuery = filters && filterDefs
        ? buildFilterQueryParam(filters, filterDefs)
        : "";

  // Query 1: standard fields (0 or 1 group_by)
  const standardQuery = useQuery({
    queryKey: ["summaries", scenarioId, standardColumns, standardGroupBy, filters ?? {}],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = {
        fields: standardColumns.join(","),
      };
      if (filterQuery) params.q = filterQuery;
      if (standardGroupBy.length > 0)
        params.group_by = standardGroupBy.join(",");

      const { data } = await api.get(
        `scenario/${scenarioId}/summaries/`,
        { signal, params },
      );
      return transformRows(standard, data);
    },
    retry: false,
    enabled: enabled && standard.length > 0,
  });

  // Query 2: multi-group-by fields (2 group_by columns)
  const multiGroupQuery = useQuery({
    queryKey: ["summaries-multi", scenarioId, multiGroupColumns, multiGroupBy, filters ?? {}],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = {
        fields: multiGroupColumns.join(","),
      };
      if (filterQuery) params.q = filterQuery;
      params.group_by = multiGroupBy.join(",");

      const { data } = await api.get(
        `scenario/${scenarioId}/summaries/`,
        { signal, params },
      );
      return transformRows(multiGroup, data);
    },
    retry: false,
    enabled: enabled && multiGroup.length > 0,
  });

  // Merge results
  const data = useMemo<SummaryData | undefined>(() => {
    const standardRows = standardQuery.data ?? [];
    const multiGroupRows = multiGroupQuery.data ?? [];
    const merged = [...standardRows, ...multiGroupRows];
    if (merged.length === 0 && !standardQuery.data && !multiGroupQuery.data)
      return undefined;
    return sortRows(merged);
  }, [standardQuery.data, multiGroupQuery.data]);

  const isLoading =
    (standard.length > 0 && standardQuery.isLoading) ||
    (multiGroup.length > 0 && multiGroupQuery.isLoading);

  return { data, isLoading };
}
