'use client';

import { Box, Button } from '@chakra-ui/react';
import { useFilters } from '@/utils/context/filters';
import { useIsFetching } from '@tanstack/react-query';

export const ApplyActions = () => {
  const { hasPendingChanges, filters, applyPendingChanges } = useFilters();

  const isLoading = !!useIsFetching({ queryKey: ['filter', filters] });
  return (
    <Box
      width='100%'
      display="flex"
      gap="4"
    >
      <Button flex="1" disabled>
        Reset
      </Button>
      <Button
        flex="1"
        colorPalette="yellow"
        onClick={applyPendingChanges}
        loading={isLoading}
        loadingText={'Loading Summary data'}
        disabled={!hasPendingChanges}
        fontFamily={'body'}
      >
        Apply
      </Button>
    </Box>
  );
};
