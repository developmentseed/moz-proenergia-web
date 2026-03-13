"use client";

import { useState, useMemo, useEffect } from "react";
import { useCoordinates } from "../map/hooks/use-coordinates";
import { useQuery, useQueries } from "@tanstack/react-query";
import { ModelProvider } from "@/utils/context/model";
import { ContextualLayersProvider } from "@/utils/context/contextual-layers";
import { FiltersProvider } from "@/utils/context/filters";
import {
  Flex,
  Box,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import NextLink from "next/link";
import MainMap from "@/components/map";
import { LuPanelLeftOpen, LuPanelLeftClose } from "react-icons/lu";
import { useAuth } from "@/utils/context/auth";
import {
  fetchModelMetadata,
  fetchVectors,
  fetchAllFilterOptions,
  mergeFilterOptions,
  transformModelCore,
  transformVectorsToLayers,
  transformFilterField,
  transformMainOptions,
} from "@/utils/data-transformation";
import { type ModelMetadata } from "@/app/types";
import MainPanel from "./main-panel";
import { Tooltip } from "./tooltip";

const ControlPanelWidth = 350;
const AnimationTime = "0.3s";

const ExplorerContent = ({ modelId }: { modelId: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { token } = useAuth();

  // Query 1: Model metadata
  const { data: modelCore } = useQuery({
    queryKey: ["modelMetadata", modelId],
    queryFn: async ({ signal }) => {
      const apiModel = await fetchModelMetadata(modelId, signal);
      return transformModelCore(apiModel);
    },
  });
  // contextual layers : separate context
  const { data: layers } = useQuery({
    queryKey: ["vectors", modelId, token],
    queryFn: async ({ signal }) => {
      const apiVectors = await fetchVectors({ modelId, token, signal });
      return transformVectorsToLayers(apiVectors);
    },
  });

  const defaultScenarioId = modelCore?.scenarios[0]?.id;

  // Filter options — one query per scenario, results merged into a union
  const filterColumns = (modelCore?.filterFields ?? []).map((f) => f.column);
  const scenarioIds = modelCore?.scenarios.map((s) => s.id) ?? [];

  const allFilterOptions = useQueries({
    queries: scenarioIds.map((scenarioId) => ({
      queryKey: ["filterOptions", scenarioId, filterColumns],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchAllFilterOptions(scenarioId, filterColumns, signal),
      enabled: filterColumns.length > 0,
    })),
    combine: (results) => {
      if (results.length === 0 || results.some((r) => !r.data)) return undefined;
      return mergeFilterOptions(results.map((r) => r.data!));
    },
  });

  // Combine filter options to main model
  const modelData = useMemo<ModelMetadata | undefined>(() => {
    if (!modelCore || !allFilterOptions) return undefined;

    const filters = modelCore.filterFields.map((field) =>
      transformFilterField(field, allFilterOptions[field.column] ?? null),
    );

    const resolvedMainOptions = transformMainOptions(
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
  }, [modelCore, allFilterOptions]);

  // Get rid of coordinates related query parameters when explorer is unmounted
  const { removeCoordinates } = useCoordinates();
  useEffect(() => {
    return () => {
      removeCoordinates();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // @TODO: A very hacky way of telling users that the data doesn't have related scenarios
  // Assuming /vectors endpoints succeeded
  if (modelCore && !defaultScenarioId && layers) {
    return (
      <Box
        h="full"
        w="full"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Box>
          This data doesnt look like it is ready. Make sure there are scenarios
          related to this model.
        </Box>
        <Box mt={4} textDecoration="underline">
          <NextLink href="/models">Return to models</NextLink>
        </Box>
      </Box>
    );
  }

  if (!modelData || !layers) {
    return (
      <Flex id="container" width="full" height="full" position="relative">
        <Skeleton width={ControlPanelWidth} height="full" />
        <Box flex={1} height="full" p={2}>
          <Skeleton width="full" height="full" />
        </Box>
        <Skeleton width={ControlPanelWidth} height="full" />
      </Flex>
    );
  }

  return (
    <ContextualLayersProvider layers={layers}>
      <FiltersProvider filterDefs={modelData.filters}>
        <ModelProvider model={modelData}>
          <Flex id="container" width="full" height="full" position="relative">
            <MainPanel isOpen={isOpen} />
            {/* Toggle Button Tab */}
            <Tooltip content={isOpen ? "Collapse control panel" : "Expand control panel"}>
              <Box
                position="absolute"
                left={isOpen ? `calc(${ControlPanelWidth}px - 1px)` : 0}
                top="8"
                transform="translateY(-50%)"
                zIndex={1000}
                transition={`left ${AnimationTime} ease`}
              >
                <IconButton
                  aria-label={isOpen ? "Collapse control panel" : "Expand control panel"}
                  onClick={() => setIsOpen(!isOpen)}
                  variant="solid"
                  size="sm"
                  bg="panelBg"
                  border="1px solid"
                  borderColor="panelBorder"
                  borderLeft="none"
                  borderLeftRadius={0}
                >
                  {isOpen ? (
                    <LuPanelLeftClose stroke="gray" />
                  ) : (
                    <LuPanelLeftOpen stroke="gray" />
                  )}
                </IconButton>
              </Box>
            </Tooltip>

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
