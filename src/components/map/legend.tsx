'use client';

import { useState } from 'react';
import { Box, VStack, HStack, Text, Separator, ScrollArea, IconButton } from '@chakra-ui/react';
import { LuDroplet } from 'react-icons/lu';
import { type MapItemUnit, type Main } from '@/app/types';
import { useContextualLayers } from '@/utils/context/contextual-layers';
import { mapControlCommonStyleProps } from './control-constant';
import { zIndex } from '@/components/ui/constant';
import { LayerEntry } from './layer-entry';
import { OpacityControl } from './opacity-control';
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

  const handleMainOpacity = (opacity: number) => {
    setMainOpacity(opacity);
    onMainOpacityChange(opacity);
  };

  return (
    <>
      <Box
        position="absolute"
        bottom={{ base: "4.75rem", md: 10 }}
        right={3}
        p={2}
        {...mapControlCommonStyleProps}
        zIndex={zIndex.mapControl}
        minW="150px"
      >
        <VStack align="stretch" gap={2}>
          <HStack w="full" align="center">
            <Text textStyle='tableAttr' mr="auto">
              {main.labelKey ? t(main.labelKey, { defaultValue: main.label }) : main.label || t('map.legend')}
            </Text>
            <HStack gap={0} flexShrink={0}>
              <OpacityControl value={mainOpacity} onValueChange={handleMainOpacity}>
                <IconButton aria-label="Adjust main layer opacity" size="2xs" variant="ghost">
                  <LuDroplet />
                </IconButton>
              </OpacityControl>
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
                      <Text fontSize="xs" lineHeight="1" fontWeight="600" mb={2}>
                        {t('map.additionalLayers')}
                      </Text>
                      <VStack align="stretch" gap={0.5}>
                        {contextualLayers.map((layer) => (
                          <Box key={layer.id} borderBottom="1px solid" borderColor="border.subtle" _last={{ borderBottom: "none" }}>
                            <LayerEntry
                              id={layer.id}
                              label={t(`layer.${layer.id}.label`, { defaultValue: layer.label })}
                              description={layer.description ? t(`layer.${layer.id}.description`, { defaultValue: layer.description }) : undefined}
                              rasterStats={layer.rasterStats}
                              isRgb={layer.isRgb}
                              layerType={layer.layerType}
                              color={layer.color ?? '#1000be'}
                              item={layer.metadata}
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
    </>
  );
}
