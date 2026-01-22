'use client';

import { Box, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';
import modelConfig from '@/config/model.json';

interface Model {
  id: string;
  name: string;
  description?: string;
}

interface SideNavProps {
  models: Model[];
  currentSlug: string;
}

export const SideNav = ({ models, currentSlug }: SideNavProps) => {
  const getIconPath = (modelId: string) => {
    const config = modelConfig.find((c) => c.model === modelId);
    return config ? `/model-icon/${config.icon}` : null;
  };

  return (
    <Box
      width={16}
      height="100%"
      bg="navBg"
      borderRight="1px solid black"
      borderColor="panelBorder"
      top={16}
      zIndex={100}
    >
      <VStack gap={0} align="stretch">
        {models.map((model) => {
          const isActive = model.id === currentSlug;
          const iconPath = getIconPath(model.id);

          return (
            <Link
              key={model.id}
              href={`/model/${model.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                m={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid black"
                width={12}
                height={12}
                bg={isActive ? 'uiPoint' : 'transparent'}
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
                    width={24}
                    height={24}
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
