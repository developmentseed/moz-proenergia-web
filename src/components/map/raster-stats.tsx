import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/utils/number';

const BREWER_GREENS_6 = ['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#31a354', '#006d2c'];

export function RasterStatsInfo({ rasterStats, isRgb }: { rasterStats?: { min: number; max: number }; isRgb?: boolean }) {
  const { t } = useTranslation();

  if (!rasterStats || isRgb) return null;

  const { min, max } = rasterStats;
  const gradient = `linear-gradient(to right, ${BREWER_GREENS_6.join(', ')})`;

  return (
    <VStack align="stretch" gap={1} mb={3} mt={3}>
      <Box h="12px" borderRadius="sm" bg={gradient} />
      <HStack justify="space-between">
        <Text fontSize="xs" color="fg.muted">{t('map.rasterMin', { value: formatNumber(min) })}</Text>
        <Text fontSize="xs" color="fg.muted">{t('map.rasterMax', { value: formatNumber(max) })}</Text>
      </HStack>
    </VStack>
  );
}
