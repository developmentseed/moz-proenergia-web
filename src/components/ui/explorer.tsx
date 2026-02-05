"use client";

import { useState, useMemo } from "react";

import { useQuery, useQueries } from "@tanstack/react-query";
import { ModelProvider } from "@/utils/context/model";
import { ContextualLayersProvider } from "@/utils/context/contextual-layers";
import { FiltersProvider } from "@/utils/context/filters";
import { Flex, Box, IconButton, Skeleton } from "@chakra-ui/react";
import MainMap from "@/components/map";
import { LuPanelRightOpen, LuPanelLeftOpen } from "react-icons/lu";
import {
  fetchModelMetadata,
  fetchVectors,
  fetchFilterOptions,
  transformModelCore,
  transformVectorsToLayers,
  transformFilterField,
  transformMainOptions,
} from "@/utils/data-transformation";
import { MapItemUnit, type ModelMetadata } from "@/app/types";
import MainPanel from "./main-panel";

const ControlPanelWidth = 350;
const AnimationTime = "0.3s";

const ExplorerContent = ({ modelId }: { modelId: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Query 1: Model metadata
  const {  data: modelCore, status, error, fetchStatus } = useQuery({
    queryKey: ['modelMetadata', modelId],
    queryFn: async () => {
      const apiModel = await fetchModelMetadata(modelId);
      return transformModelCore(apiModel);
    },
  });

  console.log('modelId:', modelId);
  console.log('query status:', status, 'fetchStatus:', fetchStatus, 'error:', error);

  // contextual layers : separate context
  // @TODO: reflect user authentication
  const { data: layers } = useQuery({
    queryKey: ["vectors"],
    queryFn: async () => {
      const apiVectors = await fetchVectors();
      return transformVectorsToLayers(apiVectors);
    },
  });

  const defaultScenarioId = modelCore?.scenarios[0]?.id;
  // Filter options (cached per scenario + column)
  const filterQueries = useQueries({
    queries: (modelCore?.filterFields ?? []).map((field) => ({
      // Filters don't change per scenario, so just using default scenario here
      queryKey: ["filterOptions", modelCore?.id, field.column],
      queryFn: () => fetchFilterOptions(defaultScenarioId!, field.column),
      enabled: !!modelCore?.id,
    })),
  });

  // Combine filter options to main model
  const modelData = useMemo<ModelMetadata | undefined>(() => {
    if (!modelCore) return undefined;

    const allFiltersLoaded = filterQueries.every((q) => q.data !== undefined);
    if (!allFiltersLoaded) return undefined;

    const filters = modelCore.filterFields.map((field, i) =>
      transformFilterField(field, filterQueries[i].data ?? null),
    );

    // Find. main option among filters (filters always have main, other wise, options are empty for main)
    const mainFilter = filters.find((f) => f.column === modelCore.main.column);
    const rawMainOptions = mainFilter
      ? (mainFilter.options as MapItemUnit[] | null)
      : [];
    const resolvedMainOptions = transformMainOptions(
      rawMainOptions,
      modelCore.colorCoding,
    );

    return {
      id: modelCore.id,
      title: modelCore.title,
      scenarios: modelCore.scenarios,
      main: {
        ...modelCore.main,
        options: resolvedMainOptions,
      },
      filters,
      popupFields: modelCore.popupFields,
      summaryFields: modelCore.summaryFields,
    };
  }, [modelCore, filterQueries]);
  if (!modelData || !layers) {
    return (
      <Flex id="container" width="full" height="full" position="relative">
        <Skeleton width={ControlPanelWidth} height="full" />
        <Box flex={1} height="full" p={2}>
          <Skeleton width="full" height="full" />
        </Box>
      </Flex>
    );
  }

  return (
    <ContextualLayersProvider layers={layers}>
      <FiltersProvider filterDefs={modelData.filters}>
        <ModelProvider model={modelData}>
          <Flex
            id="container"
            width="full"
            height="full"
            maxH="calc(100vh - 3.5rem)"
            overflow="hidden"
            position="relative"
          >
            <MainPanel isOpen={isOpen} />
            {/* Toggle Button Tab */}
            <Box
              position="absolute"
              left={isOpen ? `calc(${ControlPanelWidth}px - 1px)` : 0}
              top="8"
              transform="translateY(-50%)"
              zIndex={1000}
              transition={`left ${AnimationTime} ease`}
              border="1px solid"
              borderColor="panelBorder"
              borderLeft="none"
            >
              <IconButton
                aria-label={isOpen ? "Collapse panel" : "Expand panel"}
                onClick={() => setIsOpen(!isOpen)}
                variant="solid"
                size="sm"
                bg={isOpen ? "panelBg" : "navBg"}
                borderLeft="none"
                borderRadius={0}
              >
                {isOpen ? (
                  <LuPanelRightOpen stroke="gray" />
                ) : (
                  <LuPanelLeftOpen stroke="gray" />
                )}
              </IconButton>
            </Box>

            <Box
              transition={`width ${AnimationTime} ease`}
              height="full"
              width="full"
            >
              <MainMap main={modelData.main} />
            </Box>
          </Flex>
        </ModelProvider>
      </FiltersProvider>
    </ContextualLayersProvider>
  );
};

export default ExplorerContent;
