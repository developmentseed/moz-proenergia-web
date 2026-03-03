"use client";

import { useQuery } from "@tanstack/react-query";
import { SummaryTable } from "@/components/chakra/summary-table";
import {
  fetchModelMetadata,
  transformModelCore,
} from "@/utils/data-transformation";
import { useSummaryQuery } from "@/hooks/use-summary-query";

interface DrawerSummaryTableProps {
  modelId: string;
}

export function DrawerSummaryTable({ modelId }: DrawerSummaryTableProps) {
  // Step 1: Fetch model metadata (reuses same query key as Explorer)
  const { data: modelCore, isLoading: metaLoading } = useQuery({
    queryKey: ["modelMetadata", modelId],
    queryFn: async ({ signal }) => {
      const apiModel = await fetchModelMetadata(modelId, signal);
      return transformModelCore(apiModel);
    },
  });

  const scenarioId = modelCore?.scenarios[0]?.id;

  // Step 2: Fetch summary data with no filters (default view)
  const { data: summaryData, isLoading: summaryLoading } = useSummaryQuery({
    scenarioId: scenarioId ?? "",
    summaryFields: modelCore?.summaryFields ?? [],
    enabled: !!scenarioId,
    main: modelCore?.main,
  });

  return (
    <SummaryTable
      data={summaryData}
      isLoading={metaLoading || summaryLoading}
    />
  );
}
