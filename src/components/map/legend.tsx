import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { type MapItemUnit } from '@/app/types';

interface LegendProps {
  items: MapItemUnit[];
}

export function Legend({ items }: LegendProps) {
  return (
    <Box
      position="absolute"
      bottom={2}
      left={2}
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
            <Text fontSize="sm">{item.label}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}