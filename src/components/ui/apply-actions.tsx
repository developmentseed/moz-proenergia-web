'use client';

import { Box, Button } from '@chakra-ui/react';
import { useFilters } from '@/utils/context/filters';
import { useIsFetching } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const ApplyActions = () => {
  const { hasPendingChanges, filters, resetAllFilters, applyPendingChanges } = useFilters();
  const { t } = useTranslation();

  const isLoading = !!useIsFetching({ queryKey: ['filter', filters] });
  return (
    <Box
      width='100%'
      display="flex"
      gap="4"
    >
      <Button
        flex="1"
        onClick={resetAllFilters}
        >
        {t('explorer.reset')}
      </Button>
      <Button
        flex="1"
        colorPalette="orange"
        onClick={applyPendingChanges}
        loading={isLoading}
        loadingText={t('explorer.loadingSummary')}
        disabled={!hasPendingChanges}
        fontFamily={'body'}
      >
        {t('explorer.apply')}
      </Button>
    </Box>
  );
};
