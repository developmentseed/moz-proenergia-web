import {
  Box,
  Table,
  Spinner,
  Text,
  Alert
} from "@chakra-ui/react";

import { useQuery } from '@tanstack/react-query';

interface ClusterData {
  [key: string]: { [clusterId: string]: string | number };
}

interface SummaryPanelProps {
  clusterId: string | null;
}

async function fetchClusterData(clusterId: string): Promise<ClusterData> {
  const randomData = parseInt(clusterId)%2 === 0? 'popup_400.json': 'popup_401.json';

  const response = await fetch(`/${randomData}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cluster data');
  }
  return response.json();
}

const SummaryPanel = ({ clusterId }: SummaryPanelProps) => {

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cluster', clusterId],
    queryFn: () => fetchClusterData(clusterId!),
    enabled: !!clusterId,
  });

  if (!clusterId) return null;
  const clusterData = data && data.length && data[0];

  return (
    <Box
      background='white'
      position='absolute'
      bottom='8'
      right='4'
      zIndex={100000}
      borderRadius='md'
      boxShadow='lg'
      p={4}
      minW='400px'
      maxH='600px'
      overflowY='auto'
    >
      <Text fontSize='lg' fontWeight='bold' mb={3}>
        Cluster {clusterId} Summary
      </Text>

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

      {!isLoading && !isError && clusterData && (
      <Table.Root>
        <Table.Caption />
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(clusterData).map(([key, value]) => (
            <Table.Row key={key}>
              <Table.Cell > {key} </Table.Cell>
              <Table.Cell > {typeof value === 'number'
                      ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
                      : value
                    }
              </Table.Cell>
            </Table.Row>
        ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell />
          </Table.Row>
        </Table.Footer>
      </Table.Root>
      )}
    </Box>
  );
};

export default SummaryPanel;