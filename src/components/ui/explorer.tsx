"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { LuPanelRightOpen, LuPanelLeftOpen } from "react-icons/lu";
import { useAuth } from "@/utils/context/auth";
import {
  fetchModelMetadata,
  fetchVectors,
  fetchAllFilterOptions,
  transformModelCore,
  transformVectorsToLayers,
  transformFilterField,
  transformMainOptions,
} from "@/utils/data-transformation";
import { MapItemUnit, type ModelMetadata } from "@/app/types";
import MainPanel from "./main-panel";
import { useTranslation } from "react-i18next";

const ControlPanelWidth = 350;
const AnimationTime = "0.3s";

const ExplorerContent = ({ modelId }: { modelId: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { token } = useAuth();
  const { t } = useTranslation();

  // Clear nuqs query params from the URL when leaving the explorer page
  useEffect(() => {
    return () => {
      window.history.replaceState(null, '', window.location.pathname);
    };
  }, []);

  // Query 1: Model metadata
  const { data: modelCore } = useQuery({
    queryKey: ["modelMetadata", modelId],
    queryFn: async ({ signal }) => {
      const apiModel = await fetchModelMetadata(modelId, signal);
      return transformModelCore(apiModel);
    },
  });
  // contextual layers : separate context
  // @TODO: reflect user authentication
  const { data: layers } = useQuery({
    queryKey: ["vectors", modelId, token],
    queryFn: async ({ signal }) => {
      const apiVectors = await fetchVectors({ modelId, token, signal });
      return transformVectorsToLayers(apiVectors);
    },
  });

  const defaultScenarioId = modelCore?.scenarios[0]?.id;

  // Filter options (single batch fetch, cached per scenario)
  const filterColumns = useMemo(
    () => (modelCore?.filterFields ?? []).map((f) => f.column),
    [modelCore?.filterFields],
  );

  const { data: allFilterOptions } = useQuery({
    queryKey: ["filterOptions", modelCore?.id, filterColumns],
    queryFn: ({ signal }) => fetchAllFilterOptions(defaultScenarioId!, filterColumns, signal),
    enabled: !!modelCore?.id && !!defaultScenarioId && filterColumns.length > 0,
  });

  // Combine filter options to main model
  const modelData = useMemo<ModelMetadata | undefined>(() => {
    if (!modelCore || !allFilterOptions) return undefined;

    const filters = modelCore.filterFields.map((field) =>
      transformFilterField(field, allFilterOptions[field.column] ?? null),
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
  }, [modelCore, allFilterOptions]);

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
          {t('explorer.errorNotReady')}
        </Box>
        <Box mt={4} textDecoration="underline">
          <NextLink href="/models">{t('explorer.returnToModels')}</NextLink>
        </Box>
      </Box>
    );
  }
  // @TODO: detach layers
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
          <Flex id="container" width="full" height="full" position="relative">
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
                aria-label={isOpen ? t('explorer.collapsePanel') : t('explorer.expandPanel')}
                onClick={() => setIsOpen(!isOpen)}
                variant="solid"
                size="sm"
                bg="panelBg"
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
