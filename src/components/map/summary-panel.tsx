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
import { useQuery, useQueries } from "@tanstack/react-query";
import { controlZIndex, mapControlCommonStyleProps } from "./control-constant";
import { type Field, type Filter } from "@/app/types";
import { formatNumber } from "@/utils/numer";

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
  value: number | string;
}

interface GroupRow {
  type: "group";
  label: string;
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

interface FieldSummaryNumeric {
  key: string;
  type: "numeric";
  count: number;
  min: number;
  max: number;
  sum: number;
}

interface FieldSummaryString {
  key: string;
  type: "string";
  count: number;
  values: Record<string, number>;
}

type FieldSummary = FieldSummaryNumeric | FieldSummaryString;

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
    borderBottom="1px solid"
    borderColor="panelBorder"
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

const formatValue = (value: string | number) => {
  //@ts-expect-error @TODO
  if (!isNaN(value)) return formatNumber(value as number);
  else return value;
};

const tableCellStyleProps = {
  py: 1,
  px: 2,
};
const PanelBody = ({ data, isLoading, isError }: PanelBodyProps) => {
  return (
    <Box maxHeight={300} width="100%" overflowY="auto">
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
        <Table.Root>
          <Table.Body>
            {data.map((row) => {
              if (row.type === "flat") {
                return (
                  <Table.Row key={row.key} bg="panelBg">
                    <Table.Cell {...tableCellStyleProps}>
                      {" "}
                      <Text textStyle="tableAttr">
                        {" "}
                        {row.label}
                        {row.description && (
                          <InfoTip content={row.description} />
                        )}
                      </Text>{" "}
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue">
                        {formatValue(row.value)}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              }

              // Group type
              return [
                <Table.Row key={row.label} bg="gray.200">
                  <Table.Cell px={2} py={2} colSpan={2} fontWeight="bold">
                    <Text textStyle="tableAttr">{row.label}</Text>
                  </Table.Cell>
                </Table.Row>,
                ...row.value.map((item) => (
                  <Table.Row key={item.key} bg="panelBg">
                    <Table.Cell {...tableCellStyleProps} pl={6}>
                      <Text textStyle="tableAttr">
                        {" "}
                        {item.label}
                        <InfoTip content="description" />
                      </Text>
                    </Table.Cell>
                    <Table.Cell {...tableCellStyleProps}>
                      <Text textStyle="tableValue">
                        {formatValue(item.value)}
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
    .filter((field) => field.column in data)
    .map((field) => ({
      type: "flat" as const,
      key: field.column,
      label: field.label,
      description: field.description,
      value: data[field.column],
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

function buildFilterQueryString(
  filters: Record<string, [number, number] | string[] | null>,
  filterDefs: Filter[],
): string {
  const queryParts: string[] = [];

  // Build ID to column lookup
  const idToColumn = new Map(filterDefs.map((f) => [f.id, f.column]));

  for (const [filterId, value] of Object.entries(filters)) {
    if (value === null) continue;

    // Map filter ID to column name
    const column = idToColumn.get(filterId) ?? filterId;

    if (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      // Numeric filter: [min, max]
      queryParts.push(`${column}__min=${value[0]}`);
      queryParts.push(`${column}__max=${value[1]}`);
    } else if (Array.isArray(value) && value.length > 0) {
      // String array filter: join with semicolon when length is > 1
      if (value.length === 1) queryParts.push(`${column}=${value}`);
      else queryParts.push(`${column}__in=${value.join(";")}`);
    }
  }

  return queryParts.length > 0 ? `?q=${queryParts.join(",")}` : "";
}

async function fetchFieldSummary(
  scenarioId: string,
  column: string,
  filters: Record<string, [number, number] | string[] | null>,
  filterDefs: Filter[],
  signal: AbortSignal,
): Promise<FieldSummary> {
  try {
    const queryString = buildFilterQueryString(filters, filterDefs);
    const { data } = await api.get(
      `scenario/${scenarioId}/summary/${column}/${queryString}`,
      { signal },
    );
    return data;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to fetch summary data");
  }
}

function transformFieldSummary(result: FieldSummary, field: Field): SummaryRow {
  if (result.type === "numeric") {
    return {
      type: "flat" as const,
      key: field.column,
      label: `${field.label} (Total)`,
      description: field.description,
      value: result.sum,
    };
  }
  // String type - show value distribution
  return {
    type: "group" as const,
    label: field.label,
    value: Object.entries(result.values).map(([key, count]) => ({
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

  const summaryQueries = useQueries({
    queries: summaryFields.map((field) => ({
      queryKey: ["summary", scenarioId, field.column, filters],
      queryFn: ({ signal }) =>
        fetchFieldSummary(
          scenarioId,
          field.column,
          filters,
          filterDefs,
          signal,
        ),
    })),
  });

  const summaryIsLoading = summaryQueries.some((q) => q.isLoading);
  const summaryIsError = summaryQueries.some((q) => q.isError);
  const summaryData: SummaryData | undefined = summaryQueries.every(
    (q) => q.data,
  )
    ? summaryQueries.map((q, i) =>
        transformFieldSummary(q.data!, summaryFields[i]),
      )
    : undefined;

  // Views are mutually exclusive - cluster view never falls through to summary
  const showingCluster = !!clusterId;
  const dataToDisplay = showingCluster ? clusterData : summaryData;
  const isLoading = showingCluster
    ? clusterIsLoading || clusterIsFetching
    : summaryIsLoading;
  const isError = showingCluster ? clusterIsError : summaryIsError;

  const title = clusterId ? `Cluster - ${clusterId}` : "Summary";

  return (
    <Box
      position="absolute"
      top="10"
      minWidth={350}
      {...mapControlCommonStyleProps}
      zIndex={controlZIndex}
    >
      <Collapsible.Root defaultOpen>
        <PanelHeader subtitle="analysis" title={title} />
        <Collapsible.Content>
          <PanelBody
            data={dataToDisplay}
            isLoading={isLoading}
            isError={isError}
          />
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
};

export default memo(SummaryPanel);
