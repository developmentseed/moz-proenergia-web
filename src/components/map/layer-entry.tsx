'use client';

import { useState } from 'react';
import { Box, Text, IconButton, HStack } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { LuX, LuInfo, LuDroplet } from 'react-icons/lu';
import { OpacityControl } from './opacity-control';
import { LayerInfoModal } from './layer-info-modal';
import type { LegendLayer } from './types';

type LayerEntryProps = LegendLayer & {
  color: string;
  switchLayer: (layerId: string) => void;
  setOpacity: (layerId: string, opacity: number) => void;
};

export function LayerEntry({ id, name, description, color, switchLayer, setOpacity: setOpacityStore }: LayerEntryProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [opacity, setOpacity] = useState(100);

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    setOpacityStore(id, newOpacity);
  };

  return (
    <>
      <HStack w="full">
        <HStack mr="auto" minW={0} gap={1.5} align="center">
          <Box w="10px" h="10px" rounded="xs" bg={color} flexShrink={0} />
          <Text fontSize="xs" lineClamp={1}>
            {name}
          </Text>
        </HStack>
        <HStack gap={0} flexShrink={0}>
          <Tooltip content="Layer info" positioning={{ placement: 'top' }}>
            <IconButton
              aria-label="Layer info"
              size="2xs"
              variant="ghost"
              onClick={() => setInfoOpen(true)}
            >
              <LuInfo />
            </IconButton>
          </Tooltip>

          <OpacityControl value={opacity} onValueChange={handleOpacityChange}>
            <IconButton aria-label="Adjust opacity" size="2xs" variant="ghost">
              <LuDroplet />
            </IconButton>
          </OpacityControl>

          <Tooltip content="Remove layer" positioning={{ placement: 'top' }}>
            <IconButton
              aria-label="Remove layer"
              size="2xs"
              variant="ghost"
              onClick={() => switchLayer(id)}
            >
              <LuX />
            </IconButton>
          </Tooltip>
        </HStack>
      </HStack>

      <LayerInfoModal
        layer={{ id, name, description }}
        open={infoOpen}
        onOpenChange={setInfoOpen}
      />
    </>
  );
}
