'use client';

import { Box, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';
import modelConfig from '@/config/model.json';
import { ModelGroupMetadata } from '@/app/types';

interface SideNavProps {
  models: ModelGroupMetadata[];
  currentSlug: string;
}

export const SideNav = ({ models, currentSlug }: SideNavProps) => {
  const getIconPath = (modelId: string) => {
    const config = modelConfig.find((c) => String(c.model) === String(modelId));
    return config ? `/model-icon/${config.icon}` : null;
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
          const isActive = String(model.id) === currentSlug;
          const iconPath = getIconPath(model.id);

          return (
            <Link
              key={model.id}
              href={`/model/${model.id}`}
              style={{ textDecoration: 'none' }}
            >
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
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};
