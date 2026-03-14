import { memo, useState, useEffect } from "react";
import { Box, Flex, Text, IconButton, Input, Field as ChakraField, Link } from "@chakra-ui/react";
import { LuChevronLeft, LuSearch } from "react-icons/lu";
import NextLink from "next/link";
import { api } from "@/utils/api";
import { fetchModels, slugify } from "@/utils/data-transformation";
import { useModel } from "@/utils/context/model";
import { useQuery } from "@tanstack/react-query";
import { controlZIndex, mapControlCommonStyleProps } from "./control-constant";
import { type Field, type Filter, type Main } from "@/app/types";
import { type SummaryData } from "@/app/types/summary";
import { SummaryTable } from "@/components/chakra/summary-table";
import { useSummaryQuery } from "@/hooks/use-summary-query";
import { AnimationTime, ControlPanelWidth } from "../ui/main-panel";

interface SummaryPanelProps {
  clusterId: string | null;
  scenarioId: string;
  popupFields: Field[];
  summaryFields: Field[];
  filters: Record<string, [number, number] | string[] | null>;
  filterDefs: Filter[];
  resetCluster: () => void;
  onSelectCluster: (id: string) => void;
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

interface ClusterSearchProps {
  onSelectCluster: (id: string) => void;
}

const ClusterSearch = ({ onSelectCluster }: ClusterSearchProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSelectCluster(trimmed);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <ChakraField.Root>
        <ChakraField.Label fontSize="xs" color="fg.muted">
          Navigate to cluster or site
        </ChakraField.Label>
        <Flex gap={1} width="full">
          <Input
            size="sm"
            placeholder="Enter cluster ID…"
            flexBasis="100%"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <IconButton
            type="submit"
            size="sm"
            variant="surface"
            aria-label="Navigate to cluster"
            disabled={!value.trim()}
          >
            <LuSearch />
          </IconButton>
        </Flex>
      </ChakraField.Root>
    </Box>
  );
};

interface RelatedModelsProps {
  clusterId: string;
}

const RelatedModels = ({ clusterId }: RelatedModelsProps) => {
  const { model } = useModel();
  const { data: models } = useQuery({
    queryKey: ["models"],
    queryFn: ({ signal }) => fetchModels(signal),
  });

  const related = models?.filter((m) => String(m.id) !== model.id) ?? [];
  if (related.length === 0) return null;

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Text fontSize="xs" color="fg.muted">
        View cluster in other models
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
  main,
  isOpen,
}: SummaryPanelProps) => {
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

  const title = showingCluster ? `Cluster - ${clusterId}` : "Summary";

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
          subtitle="analysis"
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
        {showingCluster ? (
          <Box p={4} borderTop="1px solid" borderColor="border">
            <RelatedModels clusterId={clusterId!} />
          </Box>
        ) : (
          <Box p={4} borderTop="1px solid" borderColor="border">
            <ClusterSearch onSelectCluster={onSelectCluster} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default memo(SummaryPanel);
