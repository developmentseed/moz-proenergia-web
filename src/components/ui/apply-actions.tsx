'use client';

import { Box, Button } from '@chakra-ui/react';
import { useModel } from '@/utils/context/model';

export const ApplyActions = () => {
  const { hasPendingChanges, applyPendingChanges } = useModel();

  return (
    <Box
      position="absolute"
      // bottom={0}
      // left={0}
      // right={0}
      // p={3}
      bg="white"
      width='100%'
      borderTop="1px solid"
      borderColor="gray.200"
      zIndex={10}
    >
      <Button
        colorScheme="blue"
        width="full"
        onClick={applyPendingChanges}
      >
        Apply
      </Button>
    </Box>
  );
};
