'use client';

import { useState } from 'react';
import { Box, Container, Flex, HStack, Text, Link, Button, Dialog } from '@chakra-ui/react';
import Modal from '../chakra/modal';
import LoginForm from './login-form';
import Image from 'next/image';

export interface NavigationItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logoSrc?: string;
  logoText?: string;
  navigationItems?: NavigationItem[];
  modalContent?: React.ReactNode;
  modalTitle?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  { label: 'Explorer', href: '/model/model-1' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'About', href: '/about' },
  { label: 'SDIDataPortal', href: 'https://developmentseed.org' },
  { label: 'Login', href: 'modal' },
];

export const Header = ({
  logoSrc = '/next.svg',
  logoText = 'ProEnergia',
  navigationItems = defaultNavigationItems
}: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href === 'modal') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (

    <Box
      as="header"
      width="100%"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
      boxShadow="sm"
      >
      <Container>
        <Flex
          maxW="container.xl"
          mx="auto"
          justify="space-between"
          align="center"
        >
          {/* Logo Section - Left */}
          <Flex align="center" gap={3}>
            {/* <Image
              src={logoSrc}
              alt="Logo"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            /> */}
            <Link href='/'>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.800"
            >
                {logoText}
              </Text>
            </Link>
          </Flex>

          {/* Navigation Items - Right */}
          <HStack>
            {navigationItems.map((item) => {
              const isModal = item.href === 'modal';

              if (isModal) {
                return (
                  <Modal key={item.href} item={item} modalTitle={'Log in'} modalContent={<LoginForm />} />
                );
              }

              return (
                <Box key={item.href} margin={2}>
                  <Link
                    href={item.href}
                    fontSize="md"
                    fontWeight="medium"
                    color="gray.700"
                    _hover={{
                    color: 'blue.600',
                    textDecoration: 'none',
                  }}
                    transition="color 0.2s"
                    onClick={(e) => handleLinkClick(item.href, e)}
                >
                    {item.label}
                  </Link>
                </Box>
              );
            })}
          </HStack>
        </Flex>
      </Container>
    </Box>

  );
};

export default Header;
