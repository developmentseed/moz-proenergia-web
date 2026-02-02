import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Spinner,
  Text,
  Alert,
  IconButton
} from "@chakra-ui/react";
import { InfoTip } from '../chakra/toggle-tip';
import { LuX } from "react-icons/lu";
import { useQuery } from '@tanstack/react-query';
import { controlZIndex, mapControlCommonStyleProps } from './control-constant';

const API_ENDPOINT = 'https://proenergia-staging.ds.io/api/v1/';

interface ClusterData {
  [key: string]: { [clusterId: string]: string | number };
}

interface SummaryItem {
  key: string;
  label: string;
  value: number;
}

interface FlatRow {
  type: 'flat';
  label: string;
  key: string;
  value: number;
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
  filters: Record<string, [number, number] | string[] | null>;
  resetCluster: () => void;
}

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

const formatValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 3 });

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
                  <Table.Cell {...tableCellStyleProps}> <Text textStyle='tableAttr'> {row.label}<InfoTip content="description" /></Text> </Table.Cell>
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

function transformClusterData(data: Record<string, string | number>): SummaryData {
  return Object.entries(data).map(([key, value]) => ({
    type: 'flat' as const,
    key,
    label: key,
    value: typeof value === 'number' ? value : parseFloat(value) || 0,
  }));
}

async function fetchClusterData(scenarioId: string, clusterId: string): Promise<SummaryData> {
  const response = await fetch(`${API_ENDPOINT}scenario/${scenarioId}/feature/${clusterId}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch cluster data');
  }
  const rawData = await response.json();
  return transformClusterData(rawData);
}

const SummaryPanel = ({ clusterId, scenarioId, filters, resetCluster }: SummaryPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const { data: clusterRawData, isLoading: clusterIsLoading, isError: clusterIsError } = useQuery({
    queryKey: ['cluster', scenarioId, clusterId],
    queryFn: () => fetchClusterData(scenarioId, clusterId!),
    enabled: !!clusterId,
  });

  async function fetchFilteredData(): Promise<SummaryData> {
    const response = await fetch('/summary.json');
    if (!response.ok) {
      throw new Error('Failed to fetch summary data');
    }
    resetCluster();
    return await response.json();
  }

  const { data: summaryData, isLoading: summaryIsLoading, isError: summaryIsError } = useQuery({
    queryKey: ['filter', filters],
    queryFn: fetchFilteredData,
  });

  // const clusterData = clusterId && clusterRawData && clusterRawData.length && clusterRawData[0];
  const dataToDisplay = clusterRawData || summaryData;
  const isLoading = clusterIsLoading || summaryIsLoading;
  const isError = clusterIsError || summaryIsError;

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

export default SummaryPanel;