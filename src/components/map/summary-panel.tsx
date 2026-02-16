import { memo, useMemo, useState, useEffect } from "react";
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
import { useQuery, useQueries } from "@tanstack/react-query";
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
                        <Text textStyle="tableAttr">{row.label} { row.unit && `(${row.unit})`} </Text>
                        {row.description && (
                          <InfoTip content={row.description} />
                        )}
                      </Box>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue" textAlign="right">
                        {formatValue(row.value, row.key)}
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
                        {" "}
                        {row.unit && `(${row.unit})`}
                      </Text>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue" textAlign="right">
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

async function fetchBatchSummaries(
  scenarioId: string,
  fields: Field[],
  filters: Record<string, [number, number] | string[] | null>,
  filterDefs: Filter[],
  signal: AbortSignal,
): Promise<BatchSummariesResponse> {
  try {
    const fieldNames = fields.flatMap((f) => f.columns).join(",");
    const params: Record<string, string> = { fields: fieldNames };

    // @TODO: enable filter
    // const q = buildFilterQueryParam(filters, filterDefs);
    // if (q) params.q = q;

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

async function fetchGroupedSummary(
  scenarioId: string,
  field: Field,
  filters: Record<string, [number, number] | string[] | null>,
  filterDefs: Filter[],
  signal: AbortSignal,
): Promise<BatchSummariesResponse> {
  try {
    const fields = field.columns.join(",");

    const params: Record<string, string> = { fields };
        // @TODO: enable filter
    // const q = buildFilterQueryParam(filters, filterDefs);
    // if (q) params.q = q;
    if (field.group_by) params.group_by = field.group_by;
    if (field.method) params.method = field.method;

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

function transformFieldSummary(
  response: BatchSummariesResponse,
  field: Field,
): SummaryRow {
  const column = field.columns[0];
  const summary = response.summaries[column];

  if (!summary || summary.count === 0) {
    return {
      type: "flat",
      key: column,
      label: `${field.label} (Total)`,
      description: field.description,
      value: 0,
      unit: field.unit,
    };
  }

  if (summary.type === "numeric") {
    if (summary.grouped) {
      return {
        type: "group",
        label: field.label,
        description: field.description,
        unit: field.unit,
        value: Object.entries(summary.grouped).map(([key, stats]) => ({
          key,
          label: key,
          value: stats.sum,
        })),
      };
    }
    return {
      type: "flat",
      key: column,
      label: `${field.label} (Total)`,
      description: field.description,
      value: summary.sum,
      unit: field.unit,
    };
  }

  // String type → GroupRow with value distribution
  return {
    type: "group",
    label: field.label,
    description: field.description,
    unit: field.unit,
    value: Object.entries(summary.values).map(([key, count]) => ({
      key,
      label: key,
      value: count,
    })),
  };
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

  // Defer summary fetches so map tiles get network priority
  const [summaryEnabled, setSummaryEnabled] = useState(false);
  useEffect(() => {
    const id = requestIdleCallback(() => setSummaryEnabled(true));
    return () => cancelIdleCallback(id);
  }, []);

  // Split fields: batch those without group_by, separate those with group_by
  const { batchFields, groupedFields } = useMemo(() => {
    const batch: Field[] = [];
    const grouped: Field[] = [];
    for (const f of summaryFields) {
      if (f.group_by) grouped.push(f);
      else batch.push(f);
    }
    return { batchFields: batch, groupedFields: grouped };
  }, [summaryFields]);

  // Single request for all non-grouped fields
  const batchQuery = useQuery({
    queryKey: ["summaries", scenarioId, "batch", batchFields.map((f) => f.columns), filters],
    queryFn: ({ signal }) =>
      fetchBatchSummaries(scenarioId, batchFields, filters, filterDefs, signal),
    enabled: summaryEnabled && batchFields.length > 0,
  });

  // Separate request per grouped field
  const groupedQueries = useQueries({
    queries: groupedFields.map((field) => ({
      queryKey: ["summaries", scenarioId, field.label, field.columns, filters],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchGroupedSummary(scenarioId, field, filters, filterDefs, signal),
      enabled: summaryEnabled,
    })),
  });

  const batchReady = batchFields.length === 0 || !!batchQuery.data;
  const groupedReady = groupedQueries.every((q) => q.data);

  const summaryIsLoading =
    (batchFields.length > 0 && batchQuery.isLoading) ||
    groupedQueries.some((q) => q.isLoading);
  const summaryIsError =
    batchQuery.isError || groupedQueries.some((q) => q.isError);

  const noMatchingData =
    batchReady &&
    groupedReady &&
    (batchFields.length === 0 ||
      Object.values(batchQuery.data!.summaries).every((s) => s.count === 0)) &&
    groupedQueries.every((q) =>
      Object.values(q.data!.summaries).every((s) => s.count === 0),
    );

  // Combine results: batch fields first, then grouped fields
  const summaryData: SummaryData | undefined = (() => {
    if (!batchReady || !groupedReady) return undefined;
    return [
      ...batchFields.map((field) =>
        transformFieldSummary(batchQuery.data!, field)
      ),
      ...groupedFields.map((field, idx) =>
        transformFieldSummary(groupedQueries[idx].data!, field)
      ),
    ];
  })();

  // Views are mutually exclusive - cluster view never falls through to summary
  const showingCluster = !!clusterId;
  const dataToDisplay = showingCluster ? clusterData : summaryData;
  const isLoading = showingCluster
    ? clusterIsLoading || clusterIsFetching
    : summaryIsLoading;
  const isError = showingCluster ? clusterIsError : summaryIsError;

  const title = showingCluster ? `Cluster - ${clusterId}` : "Summary *Filter disabled temporarily*";

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
