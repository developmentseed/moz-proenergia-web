import { Box, VStack, HStack, Text } from '@chakra-ui/react';

interface LegendItem {
  value: string;
  color: string;
}

interface LegendProps {
  items: LegendItem[];
}

export function Legend({ items }: LegendProps) {
  return (
    <Box
      position="absolute"
      bottom="54px"
      right={4}
      bg="white"
      p={3}
      boxShadow="md"
      zIndex={1000}
      minW="200px"
    >
      <VStack align="stretch" gap={2}>
        <Text fontWeight="semibold" fontSize="sm" mb={1}>
          Legend
        </Text>
        {items.map((item) => (
          <HStack key={item.value} gap={2}>
            <Box
              w="20px"
              h="20px"
              bg={item.color}
              borderRadius="sm"
              flexShrink={0}
            />
            <Text fontSize="sm">{item.value}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
