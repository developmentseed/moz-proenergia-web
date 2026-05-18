"use client";

import { useState } from "react";
import { Box, Text, IconButton, HStack, Flex, VStack } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { LuX, LuInfo, LuDroplet } from "react-icons/lu";
import { OpacityControl } from "./opacity-control";
import { LayerInfoModal } from "./layer-info-modal";
import type { ItemUnit } from "@/app/types";
import { formatNumber } from "@/utils/number";
import { useTranslation } from "react-i18next";

const BREWER_YLGNBU_6 = [
  "#ffffcc",
  "#c7e9b4",
  "#7fcdbb",
  "#41b6c4",
  "#2c7fb8",
  "#253494",
];

type LayerEntryProps = ItemUnit & {
  color: string;
  layerType: string | undefined;
  rasterStats?: { min: number; max: number };
  isRgb?: boolean;
  item?: object;
  switchLayer: (layerId: string) => void;
  setOpacity: (layerId: string, opacity: number) => void;
};

export function LayerEntry({
  id,
  label,
  description,
  color,
  layerType,
  rasterStats,
  isRgb,
  item,
  switchLayer,
  setOpacity: setOpacityStore,
}: LayerEntryProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const { t } = useTranslation();
  const [opacity, setOpacity] = useState(100);

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    setOpacityStore(id, newOpacity);
  };

  const isRaster = layerType === "raster";
  const showGradient = isRaster && rasterStats && !isRgb;
  const gradient = `linear-gradient(to right, ${BREWER_YLGNBU_6.join(", ")})`;

  return (
    <>
      <Flex direction="column" w="full">
        <Flex direction="row" w="full" align="center">
          {!showGradient && (
            <Box
              w="10px"
              h="10px"
              rounded="xs"
              bg={color}
              flexShrink={0}
              mr={1.5}
            />
          )}
          <Text fontSize="xs" lineClamp={1} mr="auto" minW={0}>
            {label}
          </Text>
          <HStack gap={0} flexShrink={0}>
            <Tooltip content={t('map.layerInfo')} positioning={{ placement: "top" }}>
              <IconButton
                aria-label={t('map.layerInfo')}
                size="2xs"
                variant="ghost"
                onClick={() => setInfoOpen(true)}
              >
                <LuInfo />
              </IconButton>
            </Tooltip>

            <OpacityControl value={opacity} onValueChange={handleOpacityChange}>
              <IconButton
                aria-label="Adjust opacity"
                size="2xs"
                variant="ghost"
              >
                <LuDroplet />
              </IconButton>
            </OpacityControl>

            <Tooltip content={t('map.removeLayer')} positioning={{ placement: "top" }}>
              <IconButton
                aria-label={t('map.removeLayer')}
                size="2xs"
                variant="ghost"
                onClick={() => switchLayer(id)}
              >
                <LuX />
              </IconButton>
            </Tooltip>
          </HStack>
        </Flex>

        {showGradient && (
          <VStack align="stretch" gap={1} mt={1.5} mb={1}>
            <Box h="10px" borderRadius="xs" bg={gradient} />
            <HStack justify="space-between">
              <Text fontSize="2xs" color="fg.muted">
                {t("map.rasterMin", { value: formatNumber(rasterStats.min) })}
              </Text>
              <Text fontSize="2xs" color="fg.muted">
                {t("map.rasterMax", { value: formatNumber(rasterStats.max) })}
              </Text>
            </HStack>
          </VStack>
        )}
      </Flex>

      <LayerInfoModal
        title={label}
        description={description}
        metadata={item as Record<string, string | number | boolean | null | undefined> | undefined}
        open={infoOpen}
        onOpenChange={({ open }) => setInfoOpen(open)}
      />
    </>
  );
}
