"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsString } from 'nuqs';
import { ModelProvider } from "@/utils/context/model";
import { ContextualLayersProvider } from "@/utils/context/contextual-layers";
import { FiltersProvider } from "@/utils/context/filters";
import { useFilters } from "@/utils/context/filters";
import { useModel } from "@/utils/context/model";
import { Flex, Box, IconButton, Skeleton, Text, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import MainMap, { type FlyToFn } from "@/components/map";
import { LuPanelLeftOpen, LuPanelLeftClose, LuPanelRightOpen, LuPanelRightClose } from "react-icons/lu";
import { useAuth } from "@/utils/context/auth";
import { zIndex } from "./constant";
import {
  fetchModelMetadata,
  fetchVectors,
  fetchAllFilterOptions,
  transformModelCore,
  transformVectorsToLayers,
  transformFilterField,
  transformMainOptions,
} from "@/utils/data-transformation";
import { useMapCoords } from "@/utils/context/map-coords";
import { fetchRasters, fetchCogMetadata, transformRastersToLayers } from "@/utils/map/cog";
import { type ModelMetadata } from "@/app/types";
import MainPanel from "./main-panel";
import SummaryPanel from "@/components/map/summary-panel";
import { Tooltip } from "./tooltip";
import { useTranslation } from "react-i18next";
import { useToggle } from "@/hooks/use-toggle";
import { toaster } from "../chakra/toaster";
import { useMouseEvent } from "@/components/map/hooks/use-mouse-event";
import { ErrorBoundary } from "./error-boundary";
import { ControlPanelWidth, AnimationTime } from "./main-panel";
import { ExplorerTour } from "@/components/tour/explorer-tour";
import { useTour } from "@/context/tour";

const SummaryErrorFallback = () => {
  const { resetAllFilters } = useFilters();
  const { t } = useTranslation();
  return (
    <Box
      display={{ base: "none", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={ControlPanelWidth}
      height="100%"
      borderLeft="1px solid"
      borderColor="panelBorder"
      bg="panelBg"
      p={4}
      gap={3}
      textAlign="center"
    >
      <Text fontSize="sm" color="fg.muted">{t('explorer.summaryUnavailable')}</Text>
      <Button size="xs" variant="outline" onClick={resetAllFilters}>
        {t('explorer.resetFilters')}
      </Button>
    </Box>
  );
};

const ExplorerInner = () => {
  const { model, scenarioId } = useModel();
  const { updatedFilters } = useFilters();
  const [activeControlTab, setActiveControlTab] = useState<string>("controls");
  const { selected, onClick, setSelected } = useMouseEvent();
  const { t } = useTranslation();

  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const { isOpen: isSummaryOpen, toggle: toggleSummary, open: openSummary, close: closeSummary } = useToggle(true);

  // Collapse both panels by default on mobile; keep them open on desktop
  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px)").matches) {
      setIsControlsOpen(false);
      closeSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flyToRef = useRef<FlyToFn | null>(null);

  const resetCluster = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  useEffect(() => {
    if (selected !== null) {
      openSummary();
    }
  }, [selected, openSummary]);

  // Tour: register programmatic actions
  const { registerAction } = useTour();

  // Known representative cluster IDs per model, used by the guided tour
  const DEMO_CLUSTERS: Record<string, string> = {
    "1": "20213",
    "2": "20213",
    "3": "20213",
    "4": "1525",
    "5": "364261",
  };

  useEffect(() => {
    registerAction("selectDemoCluster", () => {
      const clusterId = DEMO_CLUSTERS[String(model.id)];
      if (clusterId) setSelected(clusterId);
    });

    registerAction("switchToLayers", () => {
      setActiveControlTab("layers");
    });

    registerAction("switchToControls", () => {
      setActiveControlTab("controls");
    });
  }, [registerAction, model.id, setSelected, setActiveControlTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      display={{ base: "grid", md: "flex" }}
      gridTemplateRows={{ base: "auto 1fr", md: undefined }}
      width="full"
      height="full"
      position="relative"
    >
      <MainPanel
        isOpen={isControlsOpen}
        onToggle={() => setIsControlsOpen((prev) => !prev)}
        activeTab={activeControlTab}
        onTabChange={setActiveControlTab}
      />

      {/* Desktop-only toggle button */}
      <Tooltip
        content={isControlsOpen ? t('explorer.collapsePanel') : t('explorer.expandPanel')}
      >
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          left={
            isControlsOpen
              ? `calc(${ControlPanelWidth}px - 1px)`
              : 0
          }
          top="8"
          transform="translateY(-50%)"
          zIndex={zIndex.mapControl}
          transition={`left ${AnimationTime} ease`}
        >
          <IconButton
            aria-label={isControlsOpen ? t('explorer.collapseControlPanel') : t('explorer.expandControlPanel')}
            onClick={() => setIsControlsOpen((prev) => !prev)}
            variant="solid"
            size="sm"
            bg="panelBg"
            border="1px solid"
            borderColor="panelBorder"
            borderLeft="none"
            borderLeftRadius={0}
          >
            {isControlsOpen ? (
              <LuPanelLeftClose stroke="gray" />
            ) : (
              <LuPanelLeftOpen stroke="gray" />
            )}
          </IconButton>
        </Box>
      </Tooltip>

      {/* Map area */}

      <Box flex={1} height="full" minHeight={0} position="relative">
        <ErrorBoundary>
          <MainMap
            main={model.main}
            onClick={onClick}
            clusterId={selected}
            onFlyToRef={flyToRef}
          />
        </ErrorBoundary>

      </Box>

      {/* Desktop-only summary panel toggle button */}
      <Tooltip
        content={isSummaryOpen ? t("collapsePanel") : t("expandPanel")}
      >
        <Box
          display={{ base: "none", md: "block" }}
          position="absolute"
          right={
            isSummaryOpen
              ? `calc(${ControlPanelWidth}px - 1px)`
              : 0
          }
          top="8"
          transform="translateY(-50%)"
          zIndex={zIndex.mapControl}
          transition={`right ${AnimationTime} ease`}
        >
          <IconButton
            aria-label={isSummaryOpen ? t("collapsePanel") : t("expandPanel")}
            onClick={toggleSummary}
            variant="solid"
            size="sm"
            bg="panelBg"
            border="1px solid"
            borderColor="panelBorder"
            borderRight="none"
            borderRightRadius={0}
          >
            {isSummaryOpen ? (
              <LuPanelRightClose stroke="gray" />
            ) : (
              <LuPanelRightOpen stroke="gray" />
            )}
          </IconButton>
        </Box>
      </Tooltip>

      <ErrorBoundary fallback={<SummaryErrorFallback />}>
        <SummaryPanel
          clusterId={selected}
          scenarioId={scenarioId}
          onSelectCluster={setSelected}
          onFlyTo={(lng, lat) => flyToRef.current?.(lng, lat)}
          popupFields={model.popupFields}
          summaryFields={model.summaryFields}
          filters={updatedFilters}
          filterDefs={model.filters}
          resetCluster={resetCluster}
          main={model.main}
          isOpen={isSummaryOpen}
          onToggle={toggleSummary}
        />

        <ExplorerTour />
      </ErrorBoundary>
    </Box>
  );
};

const ExplorerContent = ({ modelId }: { modelId: string }) => {
  const { token } = useAuth();
  const { t } = useTranslation();

  // Query 1: Model metadata
  const { data: modelCore } = useQuery({
    queryKey: ["modelMetadata", modelId, token],
    queryFn: async ({ signal }) => {
      const apiModel = await fetchModelMetadata(modelId, signal, token);
      return transformModelCore(apiModel);
    },
  });

  // The queryKeys below cache the raw ApiFileResult[] so other consumers
  // (e.g. the downloads page) can share this data. Layer transforms are
  // applied locally via select / useMemo.
  const { data: vectorLayers, isError: vectorsError } = useQuery({
    queryKey: ["vectors", modelId, token],
    queryFn: ({ signal }) => fetchVectors({ modelId, token, signal }),
    // Select is synchronious (can't be used for rasters that needs to fetch cog metadata)
    select: transformVectorsToLayers,
    throwOnError: false,
  });

  const { data: apiRasters, isError: rastersError } = useQuery({
    queryKey: ["rasters", modelId, token],
    queryFn: ({ signal }) => fetchRasters({ modelId, token, signal }),
    throwOnError: false,
  });

  const { data: rasterStatsMap } = useQuery({
    queryKey: ["rasterStats", modelId, token],
    queryFn: async () => {
      const entries = await Promise.all(
        (apiRasters ?? []).map(async (r) => {
          try {
            const stats = await fetchCogMetadata(r.raw_file);
            return [r.id, stats] as const;
          } catch {
            return [r.id, null] as const;
          }
        }),
      );
      return new Map(entries);
    },
    enabled: !!apiRasters && apiRasters.length > 0,
    throwOnError: false,
  });

  useEffect(() => {
    if (vectorsError) {
      queueMicrotask(() => toaster.create({ type: "error", title: t('explorer.vectorLoadError') }));
    }
    if (rastersError) {
      queueMicrotask(() => toaster.create({ type: "error", title: t('explorer.rasterLoadError') }));
    }
  }, [vectorsError, rastersError, t]);

  const rasterLayers = useMemo(
    () =>
      apiRasters && rasterStatsMap
        ? transformRastersToLayers(apiRasters, rasterStatsMap)
        : [],
    [apiRasters, rasterStatsMap],
  );

  const layers = useMemo(() => {
    if (!vectorLayers && !vectorsError) return undefined;
    return [...rasterLayers, ...(vectorLayers ?? [])];
  }, [vectorLayers, vectorsError, rasterLayers]);

  const defaultScenarioId = modelCore?.scenarios[0]?.id;

  // Scenario state (lifted from ModelProvider so filter query can react to changes)
  const [scenarioId, setScenarioId] = useQueryState('scenario', parseAsString);
  const activeScenarioId = scenarioId ?? defaultScenarioId;

  // Validate scenarioId against known scenarios once model loads
  useEffect(() => {
    if (!modelCore || !scenarioId) return;
    const valid = modelCore.scenarios.some((s) => s.id === scenarioId);
    if (!valid) {
      setScenarioId(defaultScenarioId?? null);
      queueMicrotask(() => toaster.create({
        type: "error",
        title: t('explorer.invalidScenario'),
      }));
    }
  }, [modelCore, scenarioId, setScenarioId, t, defaultScenarioId]);

  // Filter options (single batch fetch, refetches per scenario)
  const filterColumns = (modelCore?.filterFields ?? []).map((f) => f.column);

  const { data: allFilterOptions } = useQuery({
    queryKey: ["filterOptions", modelCore?.id, activeScenarioId, filterColumns],
    queryFn: ({ signal }) =>
      fetchAllFilterOptions(activeScenarioId!, filterColumns, signal),
    enabled: !!modelCore?.id && !!activeScenarioId && filterColumns.length > 0,
  });

  // Combine filter options to main model
  const modelData = useMemo<ModelMetadata | undefined>(() => {
    if (!modelCore || !allFilterOptions) return undefined;

    const filters = modelCore.filterFields.map((field) =>
      transformFilterField(field, allFilterOptions[field.column] ?? null, modelCore.id),
    );

    const resolvedMainOptions = transformMainOptions(modelCore.colorCoding);

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
  const { removeCoordinates } = useMapCoords();
  useEffect(() => {
    return () => {
      removeCoordinates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // @TODO: A very hacky way of telling users that the data doesn't have related scenarios
  // Assuming /vectors endpoints succeeded
  if (modelCore && !activeScenarioId && layers) {
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

  if (!modelData || !layers) {
    return (
      <Flex id="container" width="full" height="full" position="relative" direction={{ base: "column", md: "row" }}>
        <Skeleton width={{ base: "full", md: ControlPanelWidth }} height={{ base: "auto", md: "full" }} flex={{ base: 1, md: "initial" }} />
        <Box flex={{ base: 4, md: 1 }} height="full" p={2}>
          <Skeleton width="full" height="full" />
        </Box>
        <Skeleton width={{ base: "full", md: ControlPanelWidth }} height="full" flex={{ base: 1, md: "initial" }} />
      </Flex>
    );
  }

  return (
    <ContextualLayersProvider layers={layers}>
      <FiltersProvider filterDefs={modelData.filters} resetKey={activeScenarioId}>
        <ModelProvider model={modelData} scenarioId={activeScenarioId!} setScenarioId={setScenarioId}>
          <ExplorerInner />
        </ModelProvider>
      </FiltersProvider>
    </ContextualLayersProvider>
  );
};

export default ExplorerContent;
