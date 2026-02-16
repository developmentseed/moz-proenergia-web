import { memo } from "react";
import {
  Box,
  Table,
  Spinner,
  Text,
  Alert,
  Collapsible,
} from "@chakra-ui/react";
import { api } from "@/utils/api";
import { InfoTip } from "../chakra/toggle-tip";
import { LuChevronUp } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import { controlZIndex, mapControlCommonStyleProps } from "./control-constant";
import { type Field, type Filter } from "@/app/types";
import { formatDisplayNumber } from "@/utils/numer";
import { buildFilterQueryParam } from "@/utils/query-string-builder";
interface SummaryItem {
  key: string;
  label: string;
  value: number | string;
}

interface FlatRow {
  type: "flat";
  label: string;
  key: string;
  description?: string;
  unit?: string;
  value: number | string;
}

interface GroupRow {
  type: "group";
  label: string;
  description?: string;
  unit?: string;
  value: SummaryItem[];
}

type SummaryRow = FlatRow | GroupRow;

type SummaryData = SummaryRow[];
interface SummaryPanelProps {
  clusterId: string | null;
  scenarioId: string;
  popupFields: Field[];
  summaryFields: Field[];
  filters: Record<string, [number, number] | string[] | null>;
  filterDefs: Filter[];
  resetCluster: () => void;
}

// ----- Batch Summaries API types -----

interface NumericGroupStats {
  count: number;
  min: number;
  max: number;
  sum: number;
}

interface BatchSummaryNumeric {
  type: "numeric";
  count: number;
  min: number;
  max: number;
  sum: number;
  grouped?: Record<string, NumericGroupStats>;
}

interface BatchSummaryString {
  type: "string";
  count: number;
  values: Record<string, number>;
  grouped?: Record<string, { count: number; values: Record<string, number> }>;
}

type BatchFieldSummary = BatchSummaryNumeric | BatchSummaryString;

interface BatchSummariesResponse {
  scenario_id: number;
  filters_applied: string;
  summaries: Record<string, BatchFieldSummary>;
  group_by?: string;
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
  isError: boolean;
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
const PanelBody = ({ data, isLoading, isError }: PanelBodyProps) => {
  return (
    <Box maxHeight={400} width="100%" overflowY="auto" pb={4}>
      {isLoading && (
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Spinner size="xl" />
        </Box>
      )}

      {isError && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load the data</Alert.Title>
            <Alert.Description>Please try it again later.</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {!isLoading && !isError && data && (
        <Table.Root size="sm">
          <Table.Body>
            {data.map((row) => {
              if (row.type === "flat") {
                return (
                  <Table.Row key={row.key} bg="panelBg">
                    <Table.Cell {...tableCellStyleProps}>
                      {" "}
                      <Box display="flex" alignItems="center" gap={1}>
                        <Text textStyle="tableAttr">{row.label}</Text>
                        {row.description && (
                          <InfoTip content={row.description} />
                        )}
                      </Box>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue" textAlign="right">
                        {formatValue(row.value, row.key)} {row.unit}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              }

              // Group type
              return [
                <Table.Row key={row.label} bg="gray.200">
                  <Table.Cell px={2} py={2} colSpan={2} fontWeight="bold">
                    <Box display="flex" alignItems="center" gap={1}>
                      {/* group type should have description as label */}
                      <Text textStyle="tableAttr"> {row.description || row.label}</Text>
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
                      <Text textStyle="tableValue" textAlign="right">
                        {formatValue(item.value, item.key)} {row.unit}
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

async function fetchSummaries(
  scenarioId: string,
  summaryFields: Field[],
  filters: Record<string, [number, number] | string[] | null>,
  filterDefs: Filter[],
  signal: AbortSignal,
): Promise<BatchSummariesResponse> {
  try {
    const fields = summaryFields.flatMap((f) => f.columns).join(",");
    const q = buildFilterQueryParam(filters, filterDefs);
    const groupBy = summaryFields.find((f) => f.group_by)?.group_by;

    const params: Record<string, string> = { fields };
    if (q) params.q = q;
    if (groupBy) params.group_by = groupBy;

    const { data } = await api.get(
      `scenario/${scenarioId}/summaries/`,
      { signal, params },
    );
    return data;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch summary data");
  }
}

function transformBatchSummaries(
  response: BatchSummariesResponse,
  summaryFields: Field[],
): SummaryData {
  const rows: SummaryData = [];

  for (const field of summaryFields) {
    // For multi-column fields, use the first column to look up the summary
    const column = field.columns[0];
    const summary = response.summaries[column];

    if (!summary || summary.count === 0) {
      rows.push({
        type: "flat",
        key: column,
        label: `${field.label} (Total)`,
        description: field.description,
        value: 0,
        unit: field.unit,
      });
      continue;
    }

    if (summary.type === "numeric") {
      if (summary.grouped) {
        // Numeric with grouped data → GroupRow showing per-group sums
        rows.push({
          type: "group",
          label: field.label,
          description: field.description,
          unit: field.unit,
          value: Object.entries(summary.grouped).map(([key, stats]) => ({
            key,
            label: key,
            value: stats.sum,
          })),
        });
      } else {
        // Numeric without grouped data → FlatRow with total sum
        rows.push({
          type: "flat",
          key: column,
          label: `${field.label} (Total)`,
          description: field.description,
          value: summary.sum,
          unit: field.unit,
        });
      }
      continue;
    }

    // String type → GroupRow with value distribution
    rows.push({
      type: "group",
      label: field.label,
      description: field.description,
      unit: field.unit,
      value: Object.entries(summary.values).map(([key, count]) => ({
        key,
        label: key,
        value: count,
      })),
    });
  }

  return rows;
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
    enabled: !!clusterId,
  });

  const {
    data: summariesResponse,
    isLoading: summaryIsLoading,
    isError: summaryIsError,
  } = useQuery({
    queryKey: ["summaries", scenarioId, filters],
    queryFn: ({ signal }) =>
      fetchSummaries(scenarioId, summaryFields, filters, filterDefs, signal),
  });

  const noMatchingData = summariesResponse
    ? Object.values(summariesResponse.summaries).every((s) => s.count === 0)
    : false;

  const summaryData: SummaryData | undefined = summariesResponse
    ? transformBatchSummaries(summariesResponse, summaryFields)
    : undefined;

  // Views are mutually exclusive - cluster view never falls through to summary
  const showingCluster = !!clusterId;
  const dataToDisplay = showingCluster ? clusterData : summaryData;
  const isLoading = showingCluster
    ? clusterIsLoading || clusterIsFetching
    : summaryIsLoading;
  const isError = showingCluster ? clusterIsError : summaryIsError;

  const title = showingCluster ? `Cluster - ${clusterId}` : "Summary";

  return (
    <Box
      position="absolute"
      top="4"
      minWidth={"350px"}
      {...mapControlCommonStyleProps}
      zIndex={controlZIndex}
    >
      <Collapsible.Root defaultOpen>
        <PanelHeader subtitle="analysis" title={title} />
        <Collapsible.Content>
          {!showingCluster && noMatchingData ? (
            <Box px={4} py={8} textAlign="center">
              <Text textStyle="tableAttr" color="fg.muted">
                No matching data for the current filters.
              </Text>
            </Box>
          ) : (
            <PanelBody
              data={dataToDisplay}
              isLoading={isLoading}
              isError={isError}
            />
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default memo(SummaryPanel);
