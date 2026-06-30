'use client';

import { useEffect, useState } from 'react';
import { Flex, Box, Spinner, Center, Heading, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Explorer from '@/components/ui/explorer';
import { SideNav } from '@/components/layout/side-nav';
import { slugify } from '@/utils/data-transformation';
import { useModels } from '@/hooks/use-models';
import { MapCoordsProvider } from '@/utils/context/map-coords';

export default function NotFound() {
  const { t } = useTranslation();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/model\/([^/]+)\/?$/);
    if (match) {
      setSlug(match[1]);
    }
  }, []);

  const { data: models, isLoading } = useModels({
    enabled: slug !== null,
  });

  // Not a /model/[slug] path — show normal 404
  if (slug === null) {
    return (
      <Center h="calc(100dvh - 3.5rem - 1px)">
        <Box textAlign="center">
          <Heading size="2xl">404</Heading>
          <Text mt={2}>{t('error.pageNotFound')}</Text>
        </Box>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="calc(100dvh - 3.5rem - 1px)">
        <Spinner colorPalette="orange" color="colorPalette.600" size="xl" />
      </Center>
    );
  }

  const model = models?.find(
    (m) => slugify(m.name) === slug || String(m.id) === slug
  );

  // URL matched /model/[slug] but no model found in API
  if (!model) {
    return (
      <Center h="calc(100dvh - 3.5rem - 1px)">
        <Box textAlign="center">
          <Heading size="2xl">404</Heading>
          <Text mt={2}>{t('error.modelNotFound')}</Text>
        </Box>
      </Center>
    );
  }
  // Finally, return explorer page if model was found
  return (
    <MapCoordsProvider>
      <Flex h="calc(100dvh - 3.5rem - 1px)" maxH="calc(100dvh - 3.5rem - 1px)" overflow="hidden" width="100%">
        <SideNav models={models!} currentSlug={slug} />
        <Box id='main-panel' width='full' height="100%">
          <Explorer modelId={model.id} />
        </Box>
      </Flex>
    </MapCoordsProvider>
  );
}
