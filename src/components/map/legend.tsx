import { Box, VStack, HStack, Text, Separator, ScrollArea } from '@chakra-ui/react';
import { type MapItemUnit } from '@/app/types';
import { useContextualLayers } from '@/utils/context/contextual-layers';
import { controlZIndex, mapControlCommonStyleProps } from './control-constant';

interface LegendProps {
  items: MapItemUnit[];
}

export function Legend({ items }: LegendProps) {
  const { layers, activeLayers } = useContextualLayers();
  const contextualLayers = layers.filter(l => activeLayers.includes(l.id));
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
        {contextualLayers.length > 0 && (
          <>
            <Separator />
            <ScrollArea.Root size="xs">
              <ScrollArea.Viewport>
                <ScrollArea.Content spaceY="4" textStyle="sm">
                  <Text textStyle='tableAttr' mb={1}>
                    Additional layers
                  </Text>
                  {contextualLayers.map((layer) => (
                    <HStack key={layer.id} gap={2} maxHeight='64'>
                      <Box
                        w="3"
                        h="3"
                        bg={layer.color}
                        borderRadius="100%"
                        border='1px solid black'
                        flexShrink={0}
                />
                      <Text textStyle='tableValue'>{layer.label}</Text>
                    </HStack>
            ))}
                </ScrollArea.Content>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar orientation="vertical" />
              <ScrollArea.Corner bg="bg" />
            </ScrollArea.Root>
          </>
        )}
      </VStack>
    </Box>
  );
}