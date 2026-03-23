'use client';

import { Box, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createSerializer } from 'nuqs/server';
import modelConfig from '@/config/model.json';
import { ModelGroupMetadata } from '@/app/types';
import { slugify } from '@/utils/data-transformation';
import { coordinateParsers } from '@/utils/context/map-coords';
import { Tooltip } from '../ui/tooltip';

//Generate URL with coordinates
const serialize = createSerializer(coordinateParsers);

interface SideNavProps {
  models: ModelGroupMetadata[];
  currentSlug: string;
}

export const SideNav = ({ models, currentSlug }: SideNavProps) => {
  const searchParams = useSearchParams();
  // Only carry coordinate params (lat, lng, zoom) to model links
      const coordQuery = serialize({
      lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null,
      lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null,
      zoom: searchParams.get('zoom') ? parseFloat(searchParams.get('zoom')!) : null,
      });
  const getIconPath = (modelId: string) => {
    const config = modelConfig.find((c) => String(c.model) === String(modelId));
    return config ? `/model-icon/${config.icon}` : `/model-icon/default.svg`;
  };

  return (
    <Box
      height="full"
      bg="navBg"
      borderRight="1px solid"
      borderColor="panelBorder"
      zIndex={100}
    >
      <VStack p={2} gap={2} align="center">
        {models.map((model) => {
          const modelSlug = slugify(model.name);
          const isActive = modelSlug === currentSlug;
          const iconPath = getIconPath(model.id);

          return (
            <Link
              key={model.id}
              href={`/model/${modelSlug}/` + coordQuery}
              style={{ textDecoration: 'none' }}
            >
              <Tooltip content={model.name}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  rounded="sm"
                  width={12}
                  height={12}
                  bg={isActive ? "yellow.muted" : "transparent"}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: isActive ? 'blue.600' : 'gray.200',
                  }}
                >
                  {iconPath ? (
                    <Image
                      src={iconPath}
                      alt={model.name}
                      width={20}
                      height={20}
                    />
                  ) : (
                    model.name
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
