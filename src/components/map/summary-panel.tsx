import { memo, useState, useEffect } from "react";
import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { api } from "@/utils/api";
import { LuChevronLeft } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { controlZIndex, mapControlCommonStyleProps } from "./control-constant";
import { type Field, type Filter, type Main } from "@/app/types";
import { type SummaryData } from "@/app/types/summary";
import { SummaryTable } from "@/components/chakra/summary-table";
import { useSummaryQuery } from "@/hooks/use-summary-query";
import { AnimationTime, ControlPanelWidth } from "../ui/main-panel";
import { useTranslation } from "react-i18next";

interface SummaryPanelProps {
  clusterId: string | null;
  scenarioId: string;
  popupFields: Field[];
  summaryFields: Field[];
  filters: Record<string, [number, number] | string[] | null>;
  filterDefs: Filter[];
  resetCluster: () => void;
  main?: Main;
  isOpen: boolean;
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
  main,
  isOpen,
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

  const { data: summaryData, isLoading: summaryIsLoading } = useSummaryQuery({
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

  const title = showingCluster
    ? t('explorer.cluster', { clusterId })
    : t('explorer.summary');

  return (
    <Box
      position="relative"
      bg="panelBg"
      borderLeftWidth={isOpen ? "1px" : 0}
      borderLeftStyle={"solid"}
      borderLeftColor="panelBorder"
      transition={`width ${AnimationTime} ease`}
      width={isOpen ? ControlPanelWidth : 0}
    >
      <Box
        {...mapControlCommonStyleProps}
        width={ControlPanelWidth}
        height="100%"
        display="flex"
        flexDirection="column"
        zIndex={controlZIndex}
      >
        <PanelHeader
          subtitle={t('explorer.analysis')}
          title={title}
          onBack={showingCluster ? resetCluster : undefined}
        />
        <Box p={4} pt={0} flex={1} minHeight={0} overflowY="auto">
          <SummaryTable
            data={dataToDisplay}
            isLoading={isLoading}
            isError={showingCluster && clusterIsError}
            collapsible={!showingCluster}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default memo(SummaryPanel);
