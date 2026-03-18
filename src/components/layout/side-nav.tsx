'use client';

import { Box, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import modelConfig from '@/config/model.json';
import { ModelGroupMetadata } from '@/app/types';
import { slugify } from '@/utils/data-transformation';
import { Tooltip } from '../ui/tooltip';

interface SideNavProps {
  models: ModelGroupMetadata[];
  currentSlug: string;
}

export const SideNav = ({ models, currentSlug }: SideNavProps) => {
  const searchParams = useSearchParams();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const zoom = searchParams.get('zoom');

  const coordParams = new URLSearchParams();
  if (lat) coordParams.set('lat', lat);
  if (lng) coordParams.set('lng', lng);
  if (zoom) coordParams.set('zoom', zoom);
  const coordString = coordParams.toString();
  
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
              href={`/model/${modelSlug}${coordString ? `?${coordString}` : ''}`}
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
