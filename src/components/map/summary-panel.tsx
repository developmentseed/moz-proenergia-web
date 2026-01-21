import { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Spinner,
  Text,
  Alert,
  IconButton
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { useQuery } from '@tanstack/react-query';

interface ClusterData {
  [key: string]: { [clusterId: string]: string | number };
}

interface SummaryData {
  [key: string]: string | number ;
}
interface SummaryPanelProps {
  clusterId: string | null;
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
  data: Record<string, string | number> | null;
  isLoading: boolean;
  isError: boolean;
}

const PanelBody = ({ data, isLoading, isError }: PanelBodyProps) => (
  <Box px={4} pb={4}>
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
        <Table.Caption />
        <Table.Body>
          {Object.entries(data).map(([key, value]) => (
            <Table.Row key={key}>
              <Table.Cell>{key}</Table.Cell>
              <Table.Cell>
                {typeof value === 'number'
                  ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
                  : value
                }
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    )}
  </Box>
);

async function fetchClusterData(clusterId: string): Promise<ClusterData> {
  const randomData = parseInt(clusterId)%2 === 0? 'popup_400.json': 'popup_401.json';

  const response = await fetch(`/${randomData}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cluster data');
  }
  return response.json();
}

const SummaryPanel = ({ clusterId, filters, resetCluster }: SummaryPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  async function fetchFilteredData(filters: Record<string, [number, number] | string[] | null>): Promise<SummaryData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    resetCluster();
    return { data: Math.random(), ...filters };
  }

  const { data: clusterRawData, isLoading: clusterIsLoading, isError: clusterIsError } = useQuery({
    queryKey: ['cluster', clusterId],
    queryFn: () => fetchClusterData(clusterId!),
    enabled: !!clusterId,
  });

  const { data: summaryData, isLoading: summaryIsLoading, isError: summaryIsError } = useQuery({
    queryKey: ['filter', filters],
    queryFn: () => fetchFilteredData(filters),
    // enabled: !!clusterId,
  });

  const clusterData = clusterId && clusterRawData && clusterRawData.length && clusterRawData[0];
  const dataToDisplay = clusterData || summaryData;
  const isLoading = clusterIsLoading || summaryIsLoading;
  const isError = clusterIsError || summaryIsError;

  useEffect(() => {
    if (!dataToDisplay) return;
    if(!isOpen) setIsOpen(true);
  },[dataToDisplay]);


  if (!isOpen) return null;

  return (
    <Box
      background='white'
      position='absolute'
      top='10'
      right='4'
      zIndex={100000}
      // p={4}
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