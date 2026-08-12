'use client';

import { Box, VStack } from '@chakra-ui/react';
import Link from '@/components/localized-link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createSerializer } from 'nuqs/server';
import { ModelGroupMetadata } from '@/app/types';
import { slugify, fetchModels } from '@/utils/data-transformation';
import { zIndex } from '@/components/ui/constant';
import { getIconPath } from '@/utils/model-icon';
import { coordinateParsers } from '@/utils/context/map-coords';
import { Tooltip } from '../ui/tooltip';
import { useTranslation } from 'react-i18next';
import { useLocalize } from '@/utils/i18n';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/utils/context/auth';

//Generate URL with coordinates
const serialize = createSerializer(coordinateParsers);

interface SideNavProps {
  models: ModelGroupMetadata[];
  currentSlug: string;
}

export const SideNav = ({ models: initialModels, currentSlug }: SideNavProps) => {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const localize = useLocalize();
  const { token } = useAuth();

  const { data: models } = useQuery({
    queryKey: ['models', token],
    queryFn: ({ signal }) => fetchModels(signal, token),
    // placeholderData (not initialData) — shows the build-time model list
    // instantly without marking the query "already fetched", so the live
    // fetch still runs immediately and replaces it once it resolves.
    placeholderData: initialModels,
    throwOnError: false,
  });
  // Only carry coordinate params (lat, lng, zoom) to model links
      const coordQuery = serialize({
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null,
      zoom: searchParams.get('zoom') ? parseFloat(searchParams.get('zoom')!) : null,
      });

  return (
    <Box
      data-tour="side-nav"
      display={{ base: 'none', md: 'flex' }}
      flexDirection="column"
      height="full"
      bg="navBg"
      borderRight="1px solid"
      borderColor="panelBorder"
      zIndex={zIndex.sideNav}
    >
      <VStack p={2} gap={2} align="center">
        {models?.map((model) => {
          const modelSlug = slugify(model.name);
          const isActive = modelSlug === currentSlug;
          const iconPath = getIconPath(model.id);

          return (
            <Link
              key={model.id}
              href={`/model/${modelSlug}/` + coordQuery}
              style={{ textDecoration: 'none' }}
            >
              <Tooltip content={localize(model.name, model.name_pt)}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  rounded="sm"
                  width={12}
                  height={12}
                  bg={isActive ? "orange.muted" : "transparent"}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: isActive ? 'orange.600' : 'orange.subtle',
                  }}
                >
                  {iconPath ? (
                    <Image
                      src={iconPath}
                      alt={localize(model.name, model.name_pt)}
                      width={20}
                      height={20}
                    />
                  ) : (
                    localize(model.name, model.name_pt)
                  )}
                </Box>
              </Tooltip>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};
