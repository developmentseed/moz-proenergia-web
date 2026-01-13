'use client';

import { Box, Button } from '@chakra-ui/react';
import { useModel } from '@/utils/context/model';

export const ApplyActions = () => {
  const { summaryDataLoading, hasPendingChanges, applyPendingChanges } = useModel();

  return (
    <Box
      width='100%'
    >
      <Button
        colorScheme="blue"
        width="full"
        onClick={applyPendingChanges}
        loading={summaryDataLoading}
        loadingText={'Loading Summary data'}
        disabled={!hasPendingChanges}
      >
        {hasPendingChanges? 'Apply Changes' : 'No pending change'}
      </Button>
    </Box>
  );
};
