'use client';

import { useEffect } from 'react';
import { Center, Box, Heading, Text, Button } from '@chakra-ui/react';
import NextLink from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Center h="calc(100vh - 3.5rem - 1px)">
      <Box textAlign="center">
        <Heading size="2xl">500</Heading>
        <Text mt={2} color="fg.muted">
          {error.message || 'An unexpected error occurred.'}
        </Text>
        <Button mt={4} variant="outline" onClick={reset}>
          Try again
        </Button>
        <Box mt={2}>
          <NextLink href="/">Return to home</NextLink>
        </Box>
      </Box>
    </Center>
  );
}
