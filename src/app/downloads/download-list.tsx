"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { Box, Spinner, Center, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MEDIA_URL_PREFIX } from "@/utils/api";
import { useAuth } from "@/utils/context/auth";
import { DownloadDataCard } from "@/components/chakra/card";
import { Search } from "@/components/ui/search";
import {
  fetchVectors,
  fetchReferences,
  type ApiFileResult,
  DataType,
} from "@/utils/data-transformation";
import { useModels } from "@/hooks/use-models";
import { fetchRasters } from "@/utils/map/cog";
import { SidebarFilter } from "./sidebar-filter";

type TaggedDataset = ApiFileResult & {
  dataType: DataType;
  modelIds: string[];
};

export const DownloadList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const { data: models } = useModels({
    enabled: isAuthenticated,
  });

  const modelIdList: string[] = useMemo(
    () => models?.map((m) => m.id) ?? [],
    [models],
  );

  // Per-model queries. Keys are aligned with `explorer.tsx` so the downloads
  // page and the map explorer share a single cache entry per (type, model).
  // Tagging with dataType/modelIds happens in `allDatasets` below, not here,
  // so the cached value is plain `ApiFileResult[]` — reusable by both pages.
  const vectorResults = useQueries({
    queries: modelIdList.map((modelId) => ({
      queryKey: ["vectors", modelId, token],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchVectors({ modelId, token, signal }),
      enabled: isAuthenticated && !!models,
    })),
  });

  const rasterResults = useQueries({
    queries: modelIdList.map((modelId) => ({
      queryKey: ["rasters", modelId, token],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchRasters({ modelId, token, signal }),
      enabled: isAuthenticated && !!models,
    })),
  });

  const referenceResults = useQueries({
    queries: modelIdList.map((modelId) => ({
      queryKey: ["references", modelId, token],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchReferences({ modelId, token, signal }),
      enabled: isAuthenticated && !!models,
    })),
  });

  // Unfiltered fetches capture datasets that have no model attached — these
  // never appear in the per-model queries above. These keys are downloads-
  // only (the explorer never fetches unfiltered lists).
  const vectorAllResult = useQuery({
    queryKey: ["vectors", null, token],
    queryFn: ({ signal }) => fetchVectors({ token, signal }),
    enabled: isAuthenticated,
  });

  const rasterAllResult = useQuery({
    queryKey: ["rasters", null, token],
    queryFn: ({ signal }) => fetchRasters({ token, signal }),
    enabled: isAuthenticated,
  });

  const referenceAllResult = useQuery({
    queryKey: ["references", null, token],
    queryFn: ({ signal }) => fetchReferences({ token, signal }),
    enabled: isAuthenticated,
  });

  // Tag + merge. Each source contributes its modelId (or none, for unfiltered)
  // and the loop collapses duplicates across models into one row whose
  // modelIds is the union. Keyed by (dataType, id) since vector/raster/ref
  // primary keys are independent and could collide.
  const allDatasets = useMemo<TaggedDataset[]>(() => {
    const byKey = new Map<string, TaggedDataset>();

    const ingest = (
      items: ApiFileResult[] | undefined,
      dataType: DataType,
      modelId: string | null,
    ) => {
      for (const item of items ?? []) {
        const key = `${dataType}-${item.id}`;
        const existing = byKey.get(key);
        if (existing) {
          if (modelId && !existing.modelIds.includes(modelId)) {
            existing.modelIds.push(modelId);
          }
        } else {
          byKey.set(key, {
            ...item,
            dataType,
            modelIds: modelId ? [modelId] : [],
          });
        }
      }
    };

    ingest(vectorAllResult.data, "vector", null);
    ingest(rasterAllResult.data, "raster", null);
    ingest(referenceAllResult.data, "reference", null);
    modelIdList.forEach((modelId, idx) => {
      ingest(vectorResults[idx]?.data, "vector", modelId);
      ingest(rasterResults[idx]?.data, "raster", modelId);
      ingest(referenceResults[idx]?.data, "reference", modelId);
    });

    return Array.from(byKey.values());
  }, [
    modelIdList,
    vectorAllResult.data,
    rasterAllResult.data,
    referenceAllResult.data,
    vectorResults,
    rasterResults,
    referenceResults,
  ]);

  const visibleDatasets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allDatasets.filter((d) => {
      // Filter based on model first
      const modelOk =
        selectedModelIds.length === 0 ||
        d.modelIds.some((id) => selectedModelIds.includes(id));
      if (!modelOk) return false;
      if (!q) return true;
      // Filter text based results (name, description)
      return (
        d.name?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q)
      );
    });
  }, [allDatasets, selectedModelIds, searchQuery]);

  const isInitialLoading =
    isAuthenticated &&
    (!models ||
      vectorAllResult.isPending ||
      rasterAllResult.isPending ||
      referenceAllResult.isPending ||
      vectorResults.some((r) => r.isPending) ||
      rasterResults.some((r) => r.isPending) ||
      referenceResults.some((r) => r.isPending));

  const isError =
    vectorAllResult.isError ||
    rasterAllResult.isError ||
    referenceAllResult.isError ||
    vectorResults.some((r) => r.isError) ||
    rasterResults.some((r) => r.isError) ||
    referenceResults.some((r) => r.isError);

  const toggleModel = (id: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  // Return unauthenticated user
  if (!isAuthenticated) {
    return (
      <Center py={10}>
        <Text>Access not allowed</Text>
      </Center>
    );
  }

  return (
    <Flex gap={8} align="flex-start" direction={{ base: "column", md: "row" }}>
      <SidebarFilter
        models={models}
        selectedModelIds={selectedModelIds}
        onToggle={toggleModel}
        onReset={() => setSelectedModelIds([])}
      />

      {/* Dataset list */}
      <Box flex={1} minW={0}>
        <Box mb={4}>
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("downloads.searchPlaceholder")}
          />
        </Box>

        {isInitialLoading ? (
          <Center py={10}>
            <Spinner colorPalette="orange" color="colorPalette.600" size="lg" />
          </Center>
        ) : isError ? (
          <Center py={10}>
            <Text color="fg.muted">{t("downloads.loadError")}</Text>
          </Center>
        ) : (
          <>
            <Flex direction="column" gap={2}>
              {visibleDatasets.map((d) => {
                const { modelIds, dataType, ...cardItem } = d;
                return (
                  <DownloadDataCard
                    key={`${dataType}-${d.id}`}
                    title={d.name}
                    description={d.description}
                    source={d.source}
                    downloadUrl={`${MEDIA_URL_PREFIX}${d.raw_file}`}
                    highlight={searchQuery}
                    models={modelIds.map(
                      (id) => models?.find((m) => m.id === id)?.name ?? id,
                    )}
                    dataType={dataType}
                    item={cardItem}
                  />
                );
              })}
            </Flex>
            {visibleDatasets.length === 0 && (
              <Center py={10}>{t("downloads.noData")}</Center>
            )}
          </>
        )}
      </Box>
    </Flex>
  );
};
