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
    >
      <Button
        colorScheme="blue"
        width="full"
        onClick={applyPendingChanges}
        loading={isLoading}
        loadingText={'Loading Summary data'}
        disabled={!hasPendingChanges}
        fontFamily={'body'}
      >
        {hasPendingChanges? 'Apply Changes' : 'No pending change'}
      </Button>
    </Box>
  );
};
