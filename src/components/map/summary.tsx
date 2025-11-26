import { Box, VStack, Text } from '@chakra-ui/react';
import { DataTable } from './popup';
import { Graph } from './graph';

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
      maxHeight={'500px'}
      overflowY={'scroll'}
      minW="200px"
    >
      <VStack align="stretch" gap={2}>
        <Text fontWeight="semibold" fontSize="md" mb={1}>
          {title}
        </Text>
        {children || (
          <Text fontSize="xs" color="gray.600">
            Loading Data
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export function SummaryWithContent ({ data, title, graphData }: {data: Record<string, string|number> | null, title: string, graphData: number[]| null}) {
  return (
    <SummaryShell title={title}>
      {graphData&& <><Text fontSize="sm">New Connections per year</Text> <Graph data={graphData} /></>}
      {data && <DataTable data={data} />}
    </SummaryShell>
  )
}