import { useQueries } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { buildFilterQueryParam } from "@/utils/query-string-builder";
import { transformFieldSummary } from "@/utils/summary";
import { type SummaryRow, type SummaryData } from "@/app/types/summary";
import { type Field, type Filter, type Main } from "@/app/types";

interface UseSummaryQueryOptions {
  scenarioId: string;
  summaryFields: Field[];
  filters?: Record<string, [number, number] | string[] | null>;
  filterDefs?: Filter[];
  enabled?: boolean;
  main?: Main;
}

interface QueryBucket {
  fields: Field[];
  columns: string[];
  groupBy: string[];
}

function transformRows(
  fields: Field[],
  data: unknown,
  mainColorMap?: Record<string, string>,
  mainColumn?: string,
): SummaryRow[] {
  return fields.map((field) => {
    try {
      const row = transformFieldSummary(data as any, field, mainColorMap, mainColumn);
      return { ...row, category: field.category };
    } catch {
      return {
        type: "error" as const,
        label: field.label,
        key: field.columns[0],
        category: field.category,
      };
    }
  });
}

/**
 * Bucket fields by their group_by value.
 * Fields sharing the same group_by share one API call.
 * Fields with no group_by are merged into the first bucket to save the number of queries
 * (the API response always includes ungrouped totals).
 */
export function bucketFieldsByGroupBy(fields: Field[]): QueryBucket[] {
  const bucketMap = new Map<string, { fields: Field[]; groupBy: string[] }>();
  const noGroupByFields: Field[] = [];

  for (const f of fields) {
    if (!f.group_by || f.group_by.length === 0) {
      noGroupByFields.push(f);
    } else {
      const key = [...f.group_by].sort().join(",");
      const existing = bucketMap.get(key);
      if (existing) {
        existing.fields.push(f);
      } else {
        bucketMap.set(key, { fields: [f], groupBy: f.group_by });
      }
    }
  }

  const buckets = Array.from(bucketMap.values());

  if (noGroupByFields.length > 0) {
    if (buckets.length > 0) {
      buckets[0].fields = [...noGroupByFields, ...buckets[0].fields];
    } else {
      buckets.push({ fields: noGroupByFields, groupBy: [] });
    }
  }

  return buckets.map((b) => ({
    fields: b.fields,
    columns: b.fields.flatMap((f) => f.columns),
    groupBy: b.groupBy,
  }));
}

export function useSummaryQuery({
  scenarioId,
  summaryFields,
  filters,
  filterDefs,
  enabled = true,
  main,
}: UseSummaryQueryOptions) {
  const buckets = bucketFieldsByGroupBy(summaryFields);
  const filterQuery =
    filters && filterDefs ? buildFilterQueryParam(filters, filterDefs) : "";
  const mainColorMap = main?.options
    ? Object.fromEntries(
        main.options.filter((o) => o.color).map((o) => [o.value, o.color!]),
      )
    : undefined;

  const queries = useQueries({
    queries: buckets.map((bucket) => ({
      queryKey: [
        "summaries",
        scenarioId,
        bucket.columns,
        bucket.groupBy,
        filters ?? {},
      ],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const params: Record<string, string> = {
          fields: bucket.columns.join(","),
        };
        if (filterQuery) params.q = filterQuery;
        if (bucket.groupBy.length > 0)
          params.group_by = bucket.groupBy.join(",");

        const { data } = await api.get(
          `scenario/${scenarioId}/summaries/`,
          { signal, params },
        );
        return transformRows(bucket.fields, data, mainColorMap, main?.column);
      },
      retry: false,
      enabled
    })),
  });

  const allRows = queries.flatMap((q) => q.data ?? []);
  const anyHasData = queries.some((q) => q.data != null);

  const data: SummaryData | undefined = anyHasData
    ? [...allRows].sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === "flat" || a.type === "error" ? -1 : 1;
      })
    : undefined;

  const isLoading = queries.some((q) => q.isLoading);

  return { data, isLoading };
}
