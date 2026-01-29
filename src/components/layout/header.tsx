'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container, Flex, HStack, Text, Link } from '@chakra-ui/react';
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
  { label: 'Explorer', href: '/model/1' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'About', href: '/about' },
  { label: 'SDIDataPortal', href: 'https://developmentseed.org' },
  { label: 'Login', href: 'modal' },
];

export const Header = ({
  logoSrc = '/Logo.svg',
  logoText = 'Proenergia + IEP',
  navigationItems = defaultNavigationItems
}: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === 'modal') return false;
    // For /model/* paths, match any model page to Explorer
    if (href.startsWith('/model/') && pathname.startsWith('/model/')) return true;
    return pathname === href;
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href === 'modal') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  return (
    <Box
      as="header"
      width="full"
      bg="navBg"
      borderBottom="1px solid black"
      px={6}
      py={4}
      >
      <Container maxWidth='5xl'>
        <Flex
          maxW="container.xl"
          mx="auto"
          justify="space-between"
          align="center"
        >
          {/* Logo Section - Left */}
          <Flex align="center" gap={3}>
            <Image
              src={logoSrc}
              alt="Logo"
              width={30}
              height={30}
              style={{ objectFit: 'contain' }}
            />
            <Link
              href='/'
              fontSize="1.25rem"
              fontWeight="600"
              fontFamily="body"
              color="black"
            >
              {logoText}
            </Link>
          </Flex>

          {/* Navigation Items - Right */}
          <HStack fontFamily="body">
            {navigationItems.map((item) => {
              const isModal = item.href === 'modal';
              if (isModal) {
                return (
                  <Modal key={item.href} item={item} modalTitle={'Log in'} modalContent={<LoginForm />} />
                );
              }

              const active = isActive(item.href);
              return (
                <Box key={item.href} margin={2}>
                  <Link
                    href={item.href}
                    fontSize="md"
                    fontWeight={active ? 'bold' : 'medium'}
                    color={active ? 'black' : '#A1A1AA'}
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
