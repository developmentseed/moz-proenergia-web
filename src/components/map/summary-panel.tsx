import { memo, useState, useEffect } from "react";
import { Box, Flex, Text, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { api } from "@/utils/api";
import { slugify } from "@/utils/data-transformation";
import { useModels } from "@/hooks/use-models";
import { useModel } from "@/utils/context/model";
import { LuChevronLeft, LuChevronsUpDown, LuChevronsDownUp } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { mapControlCommonStyleProps } from "./control-constant";
import { zIndex } from "@/components/ui/constant";
import { type Field, type Filter, type Main } from "@/app/types";
import { type SummaryData } from "@/app/types/summary";
import { SummaryTable } from "@/components/chakra/summary-table";
import { useSummaryQuery } from "@/hooks/use-summary-query";
import { AnimationTime, ControlPanelWidth } from "../ui/main-panel";
import { useTranslation } from "react-i18next";
import MapNavigator from "./map-navigator";

interface SummaryPanelProps {
  clusterId: string | null;
  scenarioId: string;
  popupFields: Field[];
  summaryFields: Field[];
  filters: Record<string, [number, number] | string[] | null>;
  filterDefs: Filter[];
  resetCluster: () => void;
  onSelectCluster: (id: string) => void;
  onFlyTo: (lng: number, lat: number) => void;
  main?: Main;
  isOpen: boolean;
  onToggle?: () => void;
}

interface PanelHeaderProps {
  subtitle: string;
  title: string;
  onBack?: () => void;
}

const PanelHeader = ({ title, subtitle, onBack }: PanelHeaderProps) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="start"
    justifyContent="space-between"
    width="100%"
    p={4}
    borderBottom="1px solid"
    borderColor="border"
  >
    <Text textStyle="subTitle">{subtitle}</Text>
    <Flex gap={1} align="center">
      {onBack && (
        <IconButton
          aria-label="Back to national summary"
          variant="ghost"
          size="2xs"
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
        >
          <LuChevronLeft />
        </IconButton>
      )}
      <Text textStyle="modelTitle">{title}</Text>
    </Flex>
  </Box>
);

interface RelatedModelsProps {
  clusterId: string;
}

const RelatedModels = ({ clusterId }: RelatedModelsProps) => {
  const { model } = useModel();
  const { data: models } = useModels();
  const { t } = useTranslation();

  const currentModelData = models?.find((m) => String(m.id) === model.id);
  const currentVectorDatasetId = currentModelData?.scenarios[0]?.vector_dataset?.id;

  const related = models?.filter((m) => {
    if (String(m.id) === model.id) return false;
    if (!currentVectorDatasetId) return false;
    return m.scenarios[0]?.vector_dataset?.id === currentVectorDatasetId;
  }) ?? [];

  if (related.length === 0) return null;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Text fontSize="xs" color="fg.muted">
        {t('explorer.relatedClusters')}
      </Text>
      {related.map((m) => (
        <Link
          key={m.id}
          asChild
          fontSize="sm"
          color="blue.500"
          _hover={{ textDecoration: "underline" }}
        >
          <NextLink href={`/model/${slugify(m.name)}?cluster=${clusterId}`}>
            {m.name}
          </NextLink>
        </Link>
      ))}
    </Box>
  );
};

function transformClusterData(
  data: Record<string, string | number>,
  popupFields: Field[],
): SummaryData {
  return popupFields
    .filter((field) => field.columns[0] in data)
    .map((field) => ({
      type: "flat" as const,
      key: field.columns[0],
      label: field.label,
      description: field.description,
      value: data[field.columns[0]],
    }));
}

async function fetchClusterData(
  scenarioId: string,
  clusterId: string,
  popupFields: Field[],
  signal: AbortSignal,
): Promise<SummaryData> {
  try {
    const { data } = await api.get(
      `scenario/${scenarioId}/feature/${clusterId}/`,
      {
        signal,
        transformResponse: (data) =>
          transformClusterData(JSON.parse(data), popupFields),
      },
    );
    return data;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch cluster data");
  }
}

const SummaryPanel = ({
  clusterId,
  scenarioId,
  summaryFields,
  popupFields,
  filters,
  filterDefs,
  resetCluster,
  onSelectCluster,
  onFlyTo,
  main,
  isOpen,
  onToggle = () => {},
}: SummaryPanelProps) => {
  const { t } = useTranslation();

  const {
    data: clusterData,
    isLoading: clusterIsLoading,
    isError: clusterIsError,
    isFetching: clusterIsFetching,
  } = useQuery({
    queryKey: ["cluster", scenarioId, clusterId],
    queryFn: ({ signal }) =>
      fetchClusterData(scenarioId, clusterId!, popupFields, signal),
    retry: false,
    enabled: !!clusterId,
  });

  // Defer summary fetches so map tiles get network priority
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSummaryEnabled(true), 150);
    return () => clearTimeout(id);
  }, []);

  const { data: summaryData, isLoading: summaryIsLoading, isError: summaryIsError } = useSummaryQuery({
    scenarioId,
    summaryFields,
    filters,
    filterDefs,
    enabled: true,
    main,
  });

  // Views are mutually exclusive - cluster view never falls through to summary
  const showingCluster = !!clusterId;
  const dataToDisplay = showingCluster ? clusterData : summaryData;
  const isLoading = showingCluster
    ? clusterIsLoading || clusterIsFetching
    : summaryIsLoading;
  const isError = showingCluster ? clusterIsError : summaryIsError;

  const title = showingCluster
    ? t('explorer.cluster', { clusterId })
    : t('explorer.summary');

  const summaryContent = (
    <>
      <Box display={{ base: "none", md: "block" }}>
        <PanelHeader
          subtitle={t('explorer.analysis')}
          title={title}
          onBack={showingCluster ? resetCluster : undefined}
        />
      </Box>
      <Box p={4} pt={0} flex={1} minHeight={0} overflowY="auto">
        <SummaryTable
          data={dataToDisplay}
          isLoading={isLoading}
          isError={isError}
          collapsible={!showingCluster}
        />
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile: single sliding container anchored at bottom, trigger at top.
          bottom: 0 anchors the element; increasing max-height grows upward.
          The trigger (first child, 44px) is always visible; content reveals
          below it as the drawer expands. */}
      <Box
        display={{ base: "block", md: "none" }}
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        zIndex={zIndex.mobileSummary}
        overflow="hidden"
        maxHeight={isOpen ? "80dvh" : "44px"}
        transition={`max-height ${AnimationTime} ease`}
        bg="panelBg"
        borderTop="1px solid"
        borderColor="panelBorder"
        boxShadow="lg"
      >
        {/* Trigger — always visible, moves up with drawer when expanded */}
        <Flex
          h="44px"
          px={4}
          align="center"
          justify="space-between"
          cursor="pointer"
          onClick={onToggle}
        >
          <Text fontWeight="semibold" fontSize="sm">{title}</Text>
          <Box>
            {isOpen ? <LuChevronsDownUp /> : <LuChevronsUpDown />}
          </Box>
        </Flex>
        {/* Content below trigger */}
        <Box
          display="flex"
          flexDirection="column"
          maxH="calc(80dvh - 44px)"
          overflowY="auto"
        >
          {summaryContent}
          {showingCluster ? (
            <Box p={4} borderTop="1px solid" borderColor="border">
              <RelatedModels clusterId={clusterId!} />
            </Box>
        ) :
            <Box p={4} borderTop="1px solid" borderColor="border">
              <MapNavigator onSelectCluster={onSelectCluster} onFlyTo={onFlyTo} />
            </Box>
          }
        </Box>

      </Box>

      {/* Desktop: right panel with width animation */}
      <Box
        display={{ base: "none", md: "flex" }}
        {...mapControlCommonStyleProps}
        position="relative"
        bg="panelBg"
        overflow="hidden"
        width={isOpen ? ControlPanelWidth : 0}
        height="100%"
        borderLeftWidth={isOpen ? "1px" : 0}
        borderLeftStyle="solid"
        borderLeftColor="panelBorder"
        transition={`width ${AnimationTime} ease`}
        flexDirection="column"
        zIndex={zIndex.mapControl}
      >
        {summaryContent}
        {showingCluster ? (
          <Box p={4} borderTop="1px solid" borderColor="border">
            <RelatedModels clusterId={clusterId!} />
          </Box>
        ) :
          <Box p={4} borderTop="1px solid" borderColor="border">
            <MapNavigator onSelectCluster={onSelectCluster} onFlyTo={onFlyTo} />
          </Box>
          }
      </Box>

    </>
  );
};

export default memo(SummaryPanel);
