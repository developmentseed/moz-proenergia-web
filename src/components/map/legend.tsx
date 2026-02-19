'use client';

import { useState } from 'react';
import { Box, VStack, HStack, Text, Separator, ScrollArea, IconButton } from '@chakra-ui/react';
import { LuInfo, LuDroplet } from 'react-icons/lu';
import { type MapItemUnit, type Main } from '@/app/types';
import { useContextualLayers } from '@/utils/context/contextual-layers';
import { controlZIndex, mapControlCommonStyleProps } from './control-constant';
import { LayerEntry } from './layer-entry';
import { OpacityControl } from './opacity-control';
import { ModalDialog } from '@/components/chakra/modal';
import { useTranslation } from 'react-i18next';

interface LegendProps {
  items: MapItemUnit[];
  main: Main;
  onMainOpacityChange: (opacity: number) => void;
}

export function Legend({ items, main, onMainOpacityChange }: LegendProps) {
  const { layers, activeLayers, toggleLayer, setLayerOpacity } = useContextualLayers();
  const { t } = useTranslation();
  const contextualLayers = layers.filter(l => activeLayers.includes(l.id));

  const [mainOpacity, setMainOpacity] = useState(100);
  const [mainInfoOpen, setMainInfoOpen] = useState(false);

  const handleMainOpacity = (opacity: number) => {
    setMainOpacity(opacity);
    onMainOpacityChange(opacity);
  };

  return (
    <>
      <Box
        position="absolute"
        bottom={10}
        right={3}
        p={2}
        {...mapControlCommonStyleProps}
        zIndex={controlZIndex}
        minW="150px"
      >
        <VStack align="stretch" gap={2}>
          <HStack w="full" align="center">
            <Text textStyle='tableAttr' mr="auto">
              {main.label || t('map.legend')}
            </Text>
            <HStack gap={0} flexShrink={0}>
              <OpacityControl value={mainOpacity} onValueChange={handleMainOpacity}>
                <IconButton aria-label="Adjust main layer opacity" size="2xs" variant="ghost">
                  <LuDroplet />
                </IconButton>
              </OpacityControl>
              <IconButton
                aria-label="Main layer info"
                size="2xs"
                variant="ghost"
                onClick={() => setMainInfoOpen(true)}
              >
                <LuInfo />
              </IconButton>
            </HStack>
          </HStack>

          {items.map((item) => (
            <HStack key={item.id} gap={2}>
              <Box
                w="3"
                h="3"
                bg={item.color}
                borderRadius="100%"
                border='1px solid'
                borderColor="border.emphasized"
                flexShrink={0}
              />
              <Text textStyle='tableValue'>{item.label}</Text>
            </HStack>
          ))}

          {contextualLayers.length > 0 && (
            <>
              <Separator mx={-2} />
              <ScrollArea.Root size="xs">
                <ScrollArea.Viewport>
                  <ScrollArea.Content spaceY="3" textStyle="sm">
                    <Box>
                      <Text textStyle='tableAttr' mb={2}>
                        {t('map.additionalLayers')}
                      </Text>
                      <VStack align="stretch" gap={0.5}>
                        {contextualLayers.map((layer) => (
                          <Box key={layer.id}>
                            <LayerEntry
                              id={layer.id}
                              label={layer.label}
                              description={layer.description}
                              color={layer.color ?? '#888888'}
                              switchLayer={(id) => toggleLayer({ [id]: false })}
                              setOpacity={(id, opacity) => setLayerOpacity(id, opacity)}
                            />
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar orientation="vertical" />
                <ScrollArea.Corner bg="bg" />
              </ScrollArea.Root>
            </>
          )}
        </VStack>
      </Box>

      <ModalDialog
        modalTitle={main.label || t('map.legend')}
        modalContent={main.description ? (
          <Text fontSize="sm">{main.description}</Text>
        ) : (
          <Text fontSize="sm" color="fg.muted" fontStyle="italic">
            No description available.
          </Text>
        )}
        open={mainInfoOpen}
        onOpenChange={({ open }) => setMainInfoOpen(open)}
      />
    </>
  );
}
