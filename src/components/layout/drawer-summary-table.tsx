"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SummaryTable } from "@/components/chakra/summary-table";
import {
  fetchModelMetadata,
  transformModelCore,
} from "@/utils/data-transformation";
import { useSummaryQuery } from "@/hooks/use-summary-query";
import { useAuth } from "@/utils/context/auth";
import type { Main } from "@/app/types";

interface DrawerSummaryTableProps {
  modelId: string;
}

export function DrawerSummaryTable({ modelId }: DrawerSummaryTableProps) {
  const { token } = useAuth();
  // Step 1: Fetch model metadata (reuses same query key as Explorer)
  const { data: modelCore, isLoading: metaLoading } = useQuery({
    queryKey: ["modelMetadata", modelId, token],
    queryFn: async ({ signal }) => {
      const apiModel = await fetchModelMetadata(modelId, signal, token);
      return transformModelCore(apiModel);
    },
  });

  const scenarioId = modelCore?.scenarios[0]?.id;

  // Build main.options from colorCoding so the chart colorMap is populated
  // without needing an extra API call to fetch filter options.
  const main = useMemo<Main | undefined>(() => {
    if (!modelCore) return undefined;
    return {
      ...modelCore.main,
      options: modelCore.colorCoding
        .filter((c) => c.value && c.color)
        .map((c) => ({ id: c.value, label: c.value, color: c.color })),
    };
  }, [modelCore]);

  // Step 2: Fetch summary data with no filters (default view)
  const { data: summaryData, isLoading: summaryLoading } = useSummaryQuery({
    scenarioId: scenarioId ?? "",
    summaryFields: modelCore?.summaryFields ?? [],
    enabled: !!scenarioId,
    main,
  });

  return (
    <SummaryTable
      data={summaryData}
      isLoading={metaLoading || summaryLoading}
    />
  );
}
