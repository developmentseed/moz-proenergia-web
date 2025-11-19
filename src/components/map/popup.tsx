import { Box, Table, Text } from '@chakra-ui/react';

interface PopupContentProps {
  data: Record<string, string|number>;
}

interface DataRow {
  label: string;
  value: string | number;
  key: string;
}

const formatValue = ( value: string|number): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return value.toLocaleString();
};

export function DataTable({ data }: PopupContentProps) {
  const rows: DataRow[] = Object.entries(data)
    .map(([key, value]) => ({
      key,
      label: key,
      value: formatValue(value),
    }));

  if (rows.length === 0) {
    return (
      <Box p={1}>
        <Text fontSize="sm" color="gray.500">
          No data available
        </Text>
      </Box>
    );
  }

  return (
    <Box minW="200px">
      <Table.Root size="sm" variant="outline" striped>
        <Table.Body>
          {rows.map(({ key, label, value }) => (
            <Table.Row key={key}>
              <Table.Cell fontWeight="semibold" fontSize="xs" wordBreak={'break-all'} color="gray.700">
                {label}
              </Table.Cell>
              <Table.Cell fontSize="xs" textAlign="right">
                {value}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
