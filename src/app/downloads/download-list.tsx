"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import {
  Box,
  Spinner,
  Center,
  Flex,
  Text,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MEDIA_URL_PREFIX } from "@/utils/api";
import { useAuth } from "@/utils/context/auth";
import { DownloadDataCard } from "@/components/chakra/card";
import { Search } from "@/components/ui/search";
import {
  fetchVectors,
  fetchReferences,
  fetchModels,
} from "@/utils/data-transformation";
import { fetchRasters } from "@/utils/map/cog";

type DataType = "vector" | "raster" | "reference";

function tagItems<T extends { id: number }>(items: T[], dataType: DataType) {
  return items.map((item) => ({ ...item, dataType }));
}

function dedupeById<T extends { id: number }>(items: T[]): T[] {
  return Array.from(new Map(items.map((i) => [i.id, i])).values());
}

export const DownloadList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const hasFilter = selectedModelIds.length > 0;

  const { data: models } = useQuery({
    queryKey: ["models", token],
    queryFn: ({ signal }) => fetchModels(signal, token),
  });

  // ── Display queries ───────────────────────────────────────────────────────
  // Mirrors the original approach: one query per selected model when filtered,
  // or a single unfiltered query when no selection. This is the source of truth
  // for what cards are shown.
  const displayIds: (string | undefined)[] = hasFilter
    ? selectedModelIds
    : [undefined];

  const vectorResults = useQueries({
    queries: displayIds.map((id) => ({
      queryKey: ["vector", token, id ?? "all"],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchVectors({ modelId: id, token, signal }),
      placeholderData: keepPreviousData,
    })),
  });

  const rasterResults = useQueries({
    queries: displayIds.map((id) => ({
      queryKey: ["raster", token, id ?? "all"],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchRasters({ modelId: id, token, signal }),
      placeholderData: keepPreviousData,
    })),
  });

  const referenceResults = useQueries({
    queries: displayIds.map((id) => ({
      queryKey: ["reference", token, id ?? "all"],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchReferences({ modelId: id, token, signal }),
      placeholderData: keepPreviousData,
    })),
  });

  const isLoading =
    vectorResults.some((r) => r.isLoading) ||
    rasterResults.some((r) => r.isLoading) ||
    referenceResults.some((r) => r.isLoading);

  const allData = useMemo(() => {
    const vectors = tagItems(vectorResults.flatMap((r) => r.data ?? []), "vector");
    const rasters = tagItems(rasterResults.flatMap((r) => r.data ?? []), "raster");
    // fetchReferences ignores modelId, so only include references in the
    // unfiltered view — they'd contaminate model-specific filtered results.
    const refs = hasFilter
      ? []
      : tagItems(referenceResults.flatMap((r) => r.data ?? []), "reference");
    // Dedupe across all types together so shared IDs only appear once.
    return dedupeById([...vectors, ...rasters, ...refs]);
  }, [vectorResults, rasterResults, referenceResults, hasFilter]);

  const filteredData = useMemo(
    () =>
      allData.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [allData, searchQuery],
  );
  if (!isAuthenticated) {
        return (
          <Center py={10}>
            <Text>Access not allowed</Text>
          </Center>
    );
  }

  // ── Tag queries ───────────────────────────────────────────────────────────
  // Background per-model queries used only to build the model→dataset map for
  // tag display. Not included in isLoading; their keys overlap with display
  // query keys when a filter is active so React Query reuses the cached data.
  const tagIds: string[] = useMemo(
    () => models?.map((m) => m.id) ?? [],
    [models],
  );

  const vectorTagResults = useQueries({
    queries: tagIds.map((id) => ({
      queryKey: ["vector", token, id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchVectors({ modelId: id, token, signal }),
      placeholderData: keepPreviousData,
    })),
  });

  const rasterTagResults = useQueries({
    queries: tagIds.map((id) => ({
      queryKey: ["raster", token, id],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchRasters({ modelId: id, token, signal }),
      placeholderData: keepPreviousData,
    })),
  });

  const itemModelIds = useMemo(() => {
    const map = new Map<number, string[]>();
    tagIds.forEach((modelId, idx) => {
      [vectorTagResults[idx], rasterTagResults[idx]].forEach((result) => {
        (result?.data ?? []).forEach((item) => {
          const existing = map.get(item.id) ?? [];
          if (!existing.includes(modelId)) {
            map.set(item.id, [...existing, modelId]);
          }
        });
      });
    });
    return map;
  }, [vectorTagResults, rasterTagResults, tagIds]);

  const getModelNames = (itemId: number): string[] => {
    const ids = itemModelIds.get(itemId) ?? [];
    return ids.map((id) => models?.find((m) => m.id === id)?.name ?? id);
  };

  const toggleModel = (id: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  return (
    <Flex gap={8} align="flex-start" direction={{ base: "column", md: "row" }}>
      {/* Filter sidebar */}
      <Box
        w={{ base: "full", md: "20rem" }}
        flexShrink={0}
        position={{ md: "sticky" }}
        top={{ md: 6 }}
        order={{ base: 0, md: 1 }}
      >
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="sm" fontWeight="semibold">
            {t("downloads.filterModels")}
          </Text>
        </Flex>
        <Flex direction="column" gap={2}>
          {models?.map((model) => (
            <Checkbox.Root
              key={model.id}
              size="sm"
              checked={selectedModelIds.includes(model.id)}
              onCheckedChange={() => toggleModel(model.id)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                <Text fontSize="sm">{model.name}</Text>
              </Checkbox.Label>
            </Checkbox.Root>
          ))}
        </Flex>

        <Button
          size="xs"
          variant="ghost"
          colorPalette="orange"
          onClick={() => setSelectedModelIds([])}
          mt={2}
          disabled={!hasFilter}
        >
          {t("downloads.reset")}
        </Button>
      </Box>

      {/* Dataset list */}
      <Box flex={1} minW={0}>
        <Box mb={4}>
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("downloads.searchPlaceholder")}
          />
        </Box>

        {isLoading ? (
          <Center py={10}>
            <Spinner colorPalette="orange" color="colorPalette.600" size="lg" />
          </Center>
        ) : (
          <>
            <Flex direction="column" gap={2}>
              {filteredData.map((item) => (
                <DownloadDataCard
                  key={item.id}
                  title={item.name}
                  description={item.description}
                  source={item.source}
                  updated={item.updated}
                  downloadUrl={`${MEDIA_URL_PREFIX}${item.raw_file}`}
                  highlight={searchQuery}
                  models={getModelNames(item.id)}
                  dataType={item.dataType}
                  item={item}
                />
              ))}
            </Flex>
            {filteredData.length === 0 && (
              <Center py={10}>{t("downloads.noData")}</Center>
            )}
          </>
        )}
      </Box>
    </Flex>
  );
};
