import {
  Box,
  Table,
  Spinner,
  Text,
  Alert
} from "@chakra-ui/react";
import { useModel } from "@/utils/context/model";
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
}

async function fetchClusterData(clusterId: string): Promise<ClusterData> {
  const randomData = parseInt(clusterId)%2 === 0? 'popup_400.json': 'popup_401.json';

  const response = await fetch(`/${randomData}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cluster data');
  }
  return response.json();
}

const SummaryPanel = ({ clusterId, filters }: SummaryPanelProps) => {
  const { setSummaryDataLoading, setSummaryDataError } = useModel();

  async function fetchFilteredData(filters: Record<string, [number, number] | string[] | null>): Promise<SummaryData> {
     await new Promise(resolve => setTimeout(resolve, 1000));
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
  console.log(summaryIsLoading);
  setSummaryDataLoading(summaryIsLoading);
  setSummaryDataError(summaryIsError);

  const clusterData = clusterId && clusterRawData && clusterRawData.length && clusterRawData[0];
  const dataToDisplay = clusterData || summaryData;
  const isLoading = clusterIsLoading || summaryIsLoading;
  const isError = clusterIsError || summaryIsError;

  return (
    <Box
      background='white'
      position='absolute'
      bottom='10'
      right='4'
      zIndex={100000}
      p={4}
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

      {!isLoading && !isError && dataToDisplay && (
      <Table.Root>
        <Table.Caption />
        <Table.Body>
          {Object.entries(dataToDisplay).map(([key, value]) => (
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
      </Table.Root>
      )}
    </Box>
  );
};

export default SummaryPanel;