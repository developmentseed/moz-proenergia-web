import { Box, VStack, Text } from '@chakra-ui/react';
import { Graph } from './graph';
import { DataTable } from './popup';

interface SummaryProps {
  title?: string;
  children?: React.ReactNode;
}

function SummaryShell({ title = 'Summary', children }: SummaryProps) {
  return (
    <Box
      position="absolute"
      bottom={12}
      right={4}
      bg="white"
      p={3}
      boxShadow="md"
      zIndex={1000}
      minW="200px"
    >
      <VStack align="stretch" gap={2}>
        <Text fontWeight="semibold" fontSize="sm" mb={1}>
          {title}
        </Text>
        {children || (
          <Text fontSize="sm" color="gray.600">
            No summary data available
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export function SummaryWithContent ({ data }) {
  const nationalData = {'label': 'a','value': 'b','key': 'b'}
  const isNational = !data;
  const title = isNational? 'National' : `Cluster ${data.id}`
  const displayData = isNational? nationalData: data;
  return (
    <SummaryShell title={title}>
      <Graph />
      <DataTable data={displayData} />
    </SummaryShell>
  )
}