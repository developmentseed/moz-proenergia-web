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
  fetchModels,
  type ApiFileResult,
  DataType,
} from "@/utils/data-transformation";
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

  const { data: models } = useQuery({
    queryKey: ["models", token],
    queryFn: ({ signal }) => fetchModels(signal, token),
    enabled: isAuthenticated,
  });

  const modelIdList: string[] = useMemo(
    () => models?.map((m) => m.id) ?? [],
    [models],
  );

  const vectorResults = useQueries({
    queries: modelIdList.map((modelId) => ({
      queryKey: ["vector", token, modelId],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const data = await fetchVectors({ modelId, token, signal });
        return data.map<TaggedDataset>((item) => ({
          ...item,
          dataType: "vector",
          modelIds: [modelId],
        }));
      },
      enabled: isAuthenticated && !!models,
    })),
  });

  const rasterResults = useQueries({
    queries: modelIdList.map((modelId) => ({
      queryKey: ["raster", token, modelId],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const data = await fetchRasters({ modelId, token, signal });
        return data.map<TaggedDataset>((item) => ({
          ...item,
          dataType: "raster",
          modelIds: [modelId],
        }));
      },
      enabled: isAuthenticated && !!models,
    })),
  });

  const referenceResult = useQuery({
    queryKey: ["reference", token],
    queryFn: async ({ signal }) => {
      const data = await fetchReferences({ token, signal });
      return data.map<TaggedDataset>((item) => ({
        ...item,
        dataType: "reference",
        modelIds: [],
      }));
    },
    enabled: isAuthenticated,
  });

  // Collapse entries that appear under multiple models into one row whose
  // modelIds is the union of all sources. Keyed by (dataType, id) since
  // vector/raster/reference IDs are independent and could collide.
  const allDatasets = useMemo<TaggedDataset[]>(() => {
    const byKey = new Map<string, TaggedDataset>();
    const tagged = [
      ...vectorResults.flatMap((r) => r.data ?? []),
      ...rasterResults.flatMap((r) => r.data ?? []),
      ...(referenceResult.data ?? []),
    ];
    for (const item of tagged) {
      const key = `${item.dataType}-${item.id}`;
      const existing = byKey.get(key);
      if (existing) {
        for (const id of item.modelIds) {
          if (!existing.modelIds.includes(id)) existing.modelIds.push(id);
        }
      } else {
        byKey.set(key, { ...item, modelIds: [...item.modelIds] });
      }
    }
    return Array.from(byKey.values());
  }, [vectorResults, rasterResults, referenceResult.data]);

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
      vectorResults.some((r) => r.isPending) ||
      rasterResults.some((r) => r.isPending) ||
      referenceResult.isPending);

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
                    updated={d.updated}
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
