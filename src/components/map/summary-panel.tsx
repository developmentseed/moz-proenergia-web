import { memo, useState, useEffect } from "react";
import {
  Box,
  Table,
  Spinner,
  Text,
  Collapsible,
} from "@chakra-ui/react";
import { api } from "@/utils/api";
import { InfoTip } from "../chakra/toggle-tip";
import { LuChevronUp } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { controlZIndex, mapControlCommonStyleProps } from "./control-constant";
import { type Field, type Filter } from "@/app/types";
import { formatDisplayNumber } from "@/utils/number";
import { buildFilterQueryParam } from "@/utils/query-string-builder";
import { SummaryBarChart } from "@/components/chakra/chart/bar";
import { transformFieldSummary } from "@/utils/summary";
import { type SummaryData, type SummaryRow } from "@/app/types/summary";
interface SummaryPanelProps {
  clusterId: string | null;
  scenarioId: string;
  popupFields: Field[];
  summaryFields: Field[];
  filters: Record<string, [number, number] | string[] | null>;
  filterDefs: Filter[];
  resetCluster: () => void;
}

interface PanelHeaderProps {
  subtitle: string;
  title: string;
}

const PanelHeader = ({ title, subtitle }: PanelHeaderProps) => (
  <Collapsible.Trigger
    display="flex"
    flexDirection="column"
    alignItems="start"
    justifyContent="space-between"
    width="100%"
    px={4}
    py={2}
    _open={{ borderBottom: "1px solid", borderColor: "panelBorder" }}
  >
    <Text textStyle="subTitle">{subtitle}</Text>
    <Text textStyle="modelTitle">{title}</Text>
    <Collapsible.Indicator
      transition="transform 0.2s"
      _open={{ transform: "rotate(180deg)" }}
      position="absolute"
      right={2}
      top={2}
    >
      <LuChevronUp />
    </Collapsible.Indicator>
  </Collapsible.Trigger>
);

interface PanelBodyProps {
  data: SummaryData | undefined;
  isLoading: boolean;
  isClusterError?: boolean;
}

const formatValue = (value: string | number, column?: string) => {
  //@ts-expect-error @TODO
  if (!isNaN(value)) return formatDisplayNumber(value as number, column);
  else return value;
};

const tableCellStyleProps = {
  py: 1,
  px: 4,
};

const PanelBody = ({ data, isLoading, isClusterError }: PanelBodyProps) => {
  return (
    <Box maxHeight={400} width="100%" overflowY="auto" py={4}>
      {isLoading && (
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Spinner size="xl" />
        </Box>
      )}

      {!isLoading && isClusterError && (
        <Box px={4} py={4}>
          <Text color="fg.error" textStyle="tableValue">
            Failed to load cluster data.
          </Text>
        </Box>
      )}

      {!isLoading && !isClusterError && data && (
        <Table.Root size="sm">
          <Table.Body>
            {data.map((row) => {
              if (row.type === "error") {
                return (
                  <Table.Row key={row.key} bg="panelBg">
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableAttr">{row.label}</Text>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue" textAlign="right" color="fg.error">
                        error
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              }

              if (row.type === "flat") {
                return (
                  <Table.Row key={row.key} bg="panelBg">
                    <Table.Cell {...tableCellStyleProps}>
                      {" "}
                      <Box display="flex" alignItems="center" gap={1}>
                        <Text textStyle="tableAttr">
                          {row.label}{" "}
                          <Text as="span" fontWeight="normal">
                            {row.unit && `(${row.unit})`}{" "}
                          </Text>
                        </Text>
                        {row.description && (
                          <InfoTip content={row.description} />
                        )}
                      </Box>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue" textAlign="right" fontFamily="mono">
                        {formatValue(row.value, row.key)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              }

              if (row.type === "chart") {
                if (row.chartType === "bar") {
                return (
                  <Table.Row key={row.label}>
                    <Table.Cell colSpan={2} px={2} py={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Text textStyle="tableAttr">{row.description || row.label}</Text>
                        {row.description && row.label !== row.description && (
                          <InfoTip content={row.description} />
                        )}
                      </Box>
                      <SummaryBarChart data={row.value} />
                    </Table.Cell>
                  </Table.Row>
                );
              } else return (<Text> Only Bar Chart is available.</Text>);

              }

              // Group type
              return [
                <Table.Row key={row.label} bg="gray.200">
                  <Table.Cell px={2} py={2} colSpan={2} fontWeight="bold">
                    <Box display="flex" alignItems="center" gap={1}>
                      {/* group type should have description as label */}
                      <Text textStyle="tableAttr">
                        {" "}
                        {row.description || row.label}
                        <Text as="span" fontWeight="normal">
                          {" "}
                          {row.unit && `(${row.unit})`}
                        </Text>
                      </Text>
                    </Box>
                  </Table.Cell>
                </Table.Row>,
                ...row.value.map((item) => (
                  <Table.Row key={item.key} bg="panelBg">
                    <Table.Cell {...tableCellStyleProps} pl={6}>
                      <Text textStyle="tableAttr" pt={1} pb={1}>
                        {" "}
                        {item.label}
                      </Text>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue" textAlign="right" fontFamily="mono">
                        {formatValue(item.value, item.key)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                )),
              ];
            })}
          </Table.Body>
        </Table.Root>
      )}
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
    const id = requestIdleCallback(() => setSummaryEnabled(true));
    return () => cancelIdleCallback(id);
  }, []);

  // Single batch request for all summary fields
  const allColumns = summaryFields.flatMap((f) => f.columns);
  const groupBy = summaryFields.find((f) => f.group_by)?.group_by;

  const { data: summaryData, isLoading: summaryIsLoading } = useQuery({
    queryKey: ["summaries", scenarioId, allColumns, groupBy, filters],
    queryFn: async ({ signal }) => {
      const params: Record<string, string> = { fields: allColumns.join(",") };
      const q = buildFilterQueryParam(filters, filterDefs);
      if (q) params.q = q;
      if (groupBy) params.group_by = groupBy;

      const { data } = await api.get(
        `scenario/${scenarioId}/summaries/`,
        { signal, params },
      );

      const rows: SummaryRow[] = summaryFields.map((field) => {
        try {
          return transformFieldSummary(data, field);
        } catch {
          return { type: "error" as const, label: field.label, key: field.columns[0] };
        }
      });

      return rows.sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === "flat" || a.type === "error" ? -1 : 1;
      });
    },
    retry: false,
    enabled: summaryEnabled,
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
      position="absolute"
      top="4"
      width={"350px"}
      {...mapControlCommonStyleProps}
      zIndex={controlZIndex}
    >
      <Collapsible.Root defaultOpen>
        <PanelHeader subtitle="analysis" title={title} />
        <Collapsible.Content>
          <PanelBody
            data={dataToDisplay}
            isLoading={isLoading}
            isClusterError={showingCluster && clusterIsError}
          />
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default memo(SummaryPanel);
