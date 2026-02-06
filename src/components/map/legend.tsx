import { Box, VStack, HStack, Text } from '@chakra-ui/react';
import { type MapItemUnit } from '@/app/types';
import { controlZIndex, mapControlCommonStyleProps } from './control-constant';

interface LegendProps {
  items: MapItemUnit[];
}

export function Legend({ items }: LegendProps) {
  return (
    <Box
      position="absolute"
      bottom={10}
      p={2}
      {...mapControlCommonStyleProps}
      zIndex={controlZIndex}
      minW="150px"
    >
      <VStack align="stretch" gap={2}>
        <Text textStyle='tableAttr' mb={1}>
          Legend
        </Text>
        {items.map((item) => (
          <HStack key={item.value} gap={2}>
            <Box
              w="3"
              h="3"
              bg={item.color}
              borderRadius="100%"
              border='1px solid black'
              flexShrink={0}
            />
            <Text textStyle='tableValue'>{item.label}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}