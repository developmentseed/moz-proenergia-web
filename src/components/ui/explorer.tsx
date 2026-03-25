"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useCoordinates } from "../map/hooks/use-coordinates";
import { useQuery } from "@tanstack/react-query";
import { ModelProvider } from "@/utils/context/model";
import { ContextualLayersProvider } from "@/utils/context/contextual-layers";
import { FiltersProvider } from "@/utils/context/filters";
import { useFilters } from "@/utils/context/filters";
import { useModel } from "@/utils/context/model";
import { Flex, Box, IconButton, Skeleton } from "@chakra-ui/react";
import NextLink from "next/link";
import MainMap from "@/components/map";
import { LuPanelLeftOpen, LuPanelLeftClose, LuPanelRightOpen, LuPanelRightClose } from "react-icons/lu";
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
import { type ModelMetadata } from "@/app/types";
import MainPanel from "./main-panel";
import SummaryPanel from "@/components/map/summary-panel";
import { Tooltip } from "./tooltip";
import { useToggle } from "@/hooks/use-toggle";
import { useMouseEvent } from "@/components/map/hooks/use-mouse-event";
import { ControlPanelWidth, AnimationTime } from "./main-panel";

const ExplorerInner = () => {
  const { model, scenarioId } = useModel();
  const { updatedFilters } = useFilters();
  const { selected, onClick, setSelected } = useMouseEvent();

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

  const resetCluster = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  useEffect(() => {
    if (selected !== null) {
      openSummary();
    }
  }, [selected, openSummary]);

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
      />

      {/* Desktop-only toggle button */}
      <Tooltip
        content={isControlsOpen ? "Collapse control panel" : "Expand control panel"}
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
          zIndex={1000}
          transition={`left ${AnimationTime} ease`}
        >
          <IconButton
            aria-label={isControlsOpen ? "Collapse control panel" : "Expand control panel"}
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
        <MainMap
          main={model.main}
          onClick={onClick}
          clusterId={selected}
        />
      </Box>

      {/* Desktop-only summary panel toggle button */}
      <Tooltip
        content={isSummaryOpen ? "Collapse summary panel" : "Expand summary panel"}
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
          zIndex={1000}
          transition={`right ${AnimationTime} ease`}
        >
          <IconButton
            aria-label={isSummaryOpen ? "Collapse summary panel" : "Expand summary panel"}
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

      <SummaryPanel
        clusterId={selected}
        scenarioId={scenarioId}
        popupFields={model.popupFields}
        summaryFields={model.summaryFields}
        filters={updatedFilters}
        filterDefs={model.filters}
        resetCluster={resetCluster}
        main={model.main}
        isOpen={isSummaryOpen}
        onToggle={toggleSummary}
      />
    </Box>
  );
};

const ExplorerContent = ({ modelId }: { modelId: string }) => {
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

  // Filter options (single batch fetch, cached per scenario)
  const filterColumns = (modelCore?.filterFields ?? []).map((f) => f.column);

  const { data: allFilterOptions } = useQuery({
    queryKey: ["filterOptions", modelCore?.id, filterColumns],
    queryFn: ({ signal }) =>
      fetchAllFilterOptions(defaultScenarioId!, filterColumns, signal),
    enabled: !!modelCore?.id && !!defaultScenarioId && filterColumns.length > 0,
  });

  // Combine filter options to main model
  const modelData = useMemo<ModelMetadata | undefined>(() => {
    if (!modelCore || !allFilterOptions) return undefined;

    const filters = modelCore.filterFields.map((field) =>
      transformFilterField(field, allFilterOptions[field.column] ?? null),
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
  const { removeCoordinates } = useCoordinates();
  useEffect(() => {
    return () => {
      removeCoordinates();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <ExplorerInner />
        </ModelProvider>
      </FiltersProvider>
    </ContextualLayersProvider>
  );
};

export default ExplorerContent;
