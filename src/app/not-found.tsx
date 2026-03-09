'use client';

import { useEffect, useState } from 'react';
import { Flex, Box, Spinner, Center, Heading, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import Explorer from '@/components/ui/explorer';
import { SideNav } from '@/components/layout/side-nav';
import { fetchModels, slugify } from '@/utils/data-transformation';

export default function NotFound() {
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/model\/([^/]+)\/?$/);
    if (match) {
      setSlug(match[1]);
    }
  }, []);

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => fetchModels(),
    enabled: slug !== null,
  });

  // Not a /model/[slug] path — show normal 404
  if (slug === null) {
    return (
      <Center h="calc(100vh - 3.5rem - 1px)">
        <Box textAlign="center">
          <Heading size="2xl">404</Heading>
          <Text mt={2}>Page not found</Text>
        </Box>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="calc(100vh - 3.5rem - 1px)">
        <Spinner size="xl" />
      </Center>
    );
  }

  const model = models?.find(
    (m) => slugify(m.name) === slug || String(m.id) === slug
  );

  // URL matched /model/[slug] but no model found in API
  if (!model) {
    return (
      <Center h="calc(100vh - 3.5rem - 1px)">
        <Box textAlign="center">
          <Heading size="2xl">404</Heading>
          <Text mt={2}>Model not found</Text>
        </Box>
      </Center>
    );
  }

  return (
    <Flex h="calc(100vh - 3.5rem - 1px)" maxH="calc(100vh - 3.5rem - 1px)" overflow="hidden" width="100%">
      <SideNav models={models!} currentSlug={slug} />
      <Box id='main-panel' width='full' height="100%">
        <Explorer modelId={model.id} />
      </Box>
    </Flex>
  );
}
