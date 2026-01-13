'use client';

import { Box, VStack } from '@chakra-ui/react';
import Link from 'next/link';

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
  return (
    <Box
      width={20}
      height="100%"
      bg="gray.100"
      borderRight="1px solid"
      borderColor="gray.200"
      top={16}
      zIndex={100}
    >
      <VStack gap={0} align="stretch">
        {models.map((model) => {
          const isActive = model.id === currentSlug;

          return (
            <Link
              key={model.id}
              href={`/model/${model.id}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                m={4}
                textAlign="center"
                fontSize="sm"
                width={12}
                height={12}
                fontWeight={isActive ? 'bold' : 'normal'}
                bg={isActive ? 'blue.500' : 'transparent'}
                color={isActive ? 'white' : 'gray.700'}
                cursor="pointer"
                borderBottom="1px solid"
                borderColor="gray.200"
                transition="all 0.2s"
                _hover={{
                  bg: isActive ? 'blue.600' : 'gray.200',
                }}
              >
                {model.name}
              </Box>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};
