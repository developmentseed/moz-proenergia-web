import { Box, VStack, Text } from '@chakra-ui/react';
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
            Loading Data
          </Text>
        )}
      </VStack>
    </Box>
  );
}

export function SummaryWithContent ({ data, title }: {data: Record<string, string|number>, title: string}) {
  return (
    <SummaryShell title={title}>
      {/* <Graph /> */}
      {data && <DataTable data={data} />}
    </SummaryShell>
  )
}