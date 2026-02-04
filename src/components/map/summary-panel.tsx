import { useState, useEffect, memo } from 'react';
import {
  Box,
  Table,
  Spinner,
  Text,
  Alert,
  IconButton
} from "@chakra-ui/react";
import axios from 'axios';
import { InfoTip } from '../chakra/toggle-tip';
import { LuX } from "react-icons/lu";
import { useQuery, useQueries } from '@tanstack/react-query';
import { controlZIndex, mapControlCommonStyleProps } from './control-constant';
import { type Field } from '@/app/types';
import { formatNumber } from '@/utils/numer';
const API_ENDPOINT = 'https://proenergia-staging.ds.io/api/v1/';

interface SummaryItem {
  key: string;
  label: string;
  value: number | string;
}

interface FlatRow {
  type: 'flat';
  label: string;
  key: string;
  description?: string;
  value: number | string;
}

interface GroupRow {
  type: 'group';
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
  resetCluster: () => void;
}

interface FieldSummaryNumeric {
  key: string;
  type: 'numeric';
  count: number;
  min: number;
  max: number;
  sum: number;
}

interface FieldSummaryString {
  key: string;
  type: 'string';
  count: number;
  values: Record<string, number>;
}

type FieldSummary = FieldSummaryNumeric | FieldSummaryString;

interface PanelHeaderProps {
  subtitle: string;
  title: string;
  onClose: () => void;
}

const PanelHeader = ({ title, subtitle, onClose }: PanelHeaderProps) => (
  <Box display='flex' justifyContent='space-between' alignItems='center' px={4} py={2} mb={3} borderBottom='1px solid black'>
    <Box>
      <Text textStyle='subTitle'>{subtitle}</Text>
      <Text textStyle='modelTitle'>
        {title}
      </Text>
    </Box>
    <IconButton
      aria-label='Close panel'
      size='xs'
      variant='ghost'
      onClick={onClose}
    >
      <LuX />
    </IconButton>
  </Box>
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
  py: 1, px: 2
};
const PanelBody = ({ data, isLoading, isError }: PanelBodyProps) => {

  return (
    <Box maxHeight={300} minWidth={350} overflowY='auto'>
      {isLoading && (
      <Box display='flex' alignItems='center' justifyContent='center' py={8}>
        <Spinner size='xl' />
      </Box>
    )}

      {isError && (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Failed to load the data</Alert.Title>
          <Alert.Description>
            Please try it again later.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )}

      {!isLoading && !isError && data && (
      <Table.Root>
        <Table.Body>
          {data.map((row) => {
            if (row.type === 'flat') {
              return (
                <Table.Row key={row.key} bg='panelBg'>
                  <Table.Cell {...tableCellStyleProps}> <Text textStyle='tableAttr'> {row.label}{row.description && <InfoTip content={row.description} />}</Text> </Table.Cell>
                  <Table.Cell {...tableCellStyleProps}><Text textStyle='tableValue'>{formatValue(row.value)}</Text></Table.Cell>
                </Table.Row>
              );
            }

            // Group type
            return [
              <Table.Row key={row.label} bg='gray.200'>
                <Table.Cell px={2} py={2} colSpan={2} fontWeight='bold'>
                  <Text textStyle='tableAttr'>{row.label}</Text>
                </Table.Cell>
              </Table.Row>,
              ...row.value.map((item) => (
                <Table.Row key={item.key} bg='panelBg'>
                  <Table.Cell {...tableCellStyleProps} pl={6}>
                    <Text textStyle='tableAttr'> {item.label}<InfoTip content="description" /></Text></Table.Cell>
                  <Table.Cell {...tableCellStyleProps}><Text textStyle='tableValue'>{formatValue(item.value)}</Text></Table.Cell>
                </Table.Row>
              ))
            ];
          })}
        </Table.Body>
      </Table.Root>
    )}
    </Box>
);};

function transformClusterData(
  data: Record<string, string | number>,
  popupFields: Field[]
): SummaryData {
  return popupFields
    .filter(field => field.column in data)
    .map(field => ({
      type: 'flat' as const,
      key: field.column,
      label: field.label,
      description: field.description,
      value: data[field.column]
    }));
}

async function fetchClusterData(scenarioId: string, clusterId: string, popupFields:Field[], signal: AbortSignal): Promise<SummaryData> {
  try {
    const { data } = await axios.get(`${API_ENDPOINT}scenario/${scenarioId}/feature/${clusterId}/`,
      { timeout: 3000,
        signal,
        transformResponse: (data) => transformClusterData(JSON.parse(data), popupFields)
      });
    return data;
  } catch(e) {
    console.error(e);
    throw new Error('Failed to fetch cluster data');
  }
}

async function fetchFieldSummary(scenarioId: string, column: string, signal: AbortSignal): Promise<FieldSummary> {
  try {
    const { data } = await axios.get(`${API_ENDPOINT}scenario/${scenarioId}/summary/${column}/`, { timeout: 3000, signal });
    return data;
  } catch(e) {
    console.error(e);
    throw new Error('Failed to fetch summary data');
  }
}

function transformFieldSummary(result: FieldSummary, field: Field): SummaryRow {
  if (result.type === 'numeric') {
    return {
      type: 'flat' as const,
      key: field.column,
      label: `${field.label} (Total)`,
      description: field.description,
      value: result.sum,
    };
  }
  // String type - show value distribution
  return {
    type: 'group' as const,
    label: field.label,
    value: Object.entries(result.values).map(([key, count]) => ({
      key,
      label: key,
      value: count,
    })),
  };
}

const SummaryPanel = ({ clusterId, scenarioId, summaryFields, popupFields, filters, resetCluster }: SummaryPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  // @TODO: subbing summary fields until endpoint is ready
  // const summaryFields = [{
  //     "label": "New Connections",
  //     "column": "NewHHConnectionsTotal",
  //     "description": "New connections (HH) required until 2030"
  //   },
  //   {
  //     "label": "Least-cost tech",
  //     "column": "Technology2030",
  //     "description": "Identified least-cost technology"
  //   }];
  // @TODO: better logic whether to display summary vs. cluster
  // This will wipe clusterId on landing if there is selected cluster id in url
  // useEffect(() => {
  //   resetCluster();
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // },[filters]);

  const { data: clusterData, isLoading: clusterIsLoading, isError: clusterIsError, isFetching: clusterIsFetching } = useQuery({
    queryKey: ['cluster', scenarioId, clusterId],
    queryFn: ({ signal }) => fetchClusterData(scenarioId, clusterId!, popupFields, signal),
    enabled: !!clusterId,
  });

  // Only show cluster data when not actively fetching (prevents stale data flash)
  // const clusterData = clusterRawData && !clusterIsFetching
  //   ? transformClusterData(clusterRawData, popupFields)
  //   : undefined;

  const summaryQueries = useQueries({
    queries: summaryFields.map(field => ({
      // @TODO: reflect filters
      queryKey: ['summary', scenarioId, field.column],
      queryFn: ({ signal }) => fetchFieldSummary(scenarioId, field.column, signal),
    })),
  });

  const summaryIsLoading = summaryQueries.some(q => q.isLoading);
  const summaryIsError = summaryQueries.some(q => q.isError);
  const summaryData: SummaryData | undefined = summaryQueries.every(q => q.data)
    ? summaryQueries.map((q, i) => transformFieldSummary(q.data!, summaryFields[i]))
    : undefined;

  // Views are mutually exclusive - cluster view never falls through to summary
  const showingCluster = !!clusterId;
  const dataToDisplay = showingCluster ? clusterData: summaryData;
  const isLoading = showingCluster ? (clusterIsLoading || clusterIsFetching) : summaryIsLoading;
  const isError = showingCluster ? clusterIsError : summaryIsError;

  useEffect(() => {
    if (!dataToDisplay) return;
    if (isOpen) return;
    if(!isOpen) setIsOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dataToDisplay]);

  if (!isOpen) return null;

  return (
    <Box
      position='absolute'
      top='10'
      {...mapControlCommonStyleProps}
      zIndex={controlZIndex}
    >
      <PanelHeader
        subtitle={'analysis'}
        title={clusterId ? `Cluster - ${clusterId}` : 'Summary'}
        onClose={() => setIsOpen(false)}
      />
      <PanelBody
        data={dataToDisplay}
        isLoading={isLoading}
        isError={isError}
      />
    </Box>
  );
};

export default memo(SummaryPanel);