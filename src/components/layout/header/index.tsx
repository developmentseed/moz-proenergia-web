"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Heading, Flex, HStack, Text, Link, Separator, Drawer, CloseButton, IconButton, Portal, VStack, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import { LuDownload, LuInfo, LuMap, LuMenu } from "react-icons/lu";
import DropdownMenu, { DropdownMenuItems } from "./dropdown-menu";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/utils/context/auth";
import { zIndex } from "@/components/ui/constant";

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface HeaderProps {
  logoSrc?: string;
}

export const Header = ({
  logoSrc = "/Emblem_of_Mozambique.svg",
}: HeaderProps) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navigationItems: NavigationItem[] = [
    { label: t('nav.explorer'), href: "/models", icon: <LuMap size={20} /> },
    { label: t('nav.about'), href: "/about", icon: <LuInfo size={20} /> },
    { label: t('nav.downloads'), href: "/downloads", icon: <LuDownload size={20} /> },
  ];

  const isActive = (href: string) => {
    // For /model/* paths, match any model page to Explorer
    if (href.startsWith("/models") && pathname.startsWith("/model/"))
      return true;
    return pathname === href + "/";
  };

  return (
    <Box
      as="header"
      width="full"
      bg="orange.600"
      color="orange.contrast"
      borderBottom="1px solid"
      borderBottomColor="panelBorder"
      px={3}
      py={2}
      pr={{ base: 3, md: 6 }}
    >
      <Flex mx="auto" justify="space-between" align="center">
        {/* Logo Section - Left */}
        <NextLink href="/">
          <Flex align="center" gap={3}>
            <Image
              src={logoSrc}
              alt="Logo"
              width={30}
              height={30}
              style={{ objectFit: "contain" }}
            />
            <Heading
              fontSize="1rem"
              fontWeight="300"
              fontFamily="body"
              lineHeight="1rem"
              textTransform="uppercase"
              letterSpacing="0.5px"
              color="orange.contrast"
            >
              {t('nav.countryName')} <br />
              <Text display={{ base: "inline", md: "none" }} as="span" color="orange.contrast" fontWeight="900">
                {t('nav.shortName')}
              </Text>
              <Text display={{ base: "none", md: "inline" }} as="span" color="orange.contrast" fontWeight="900">
                {t('nav.longName')}
              </Text>
            </Heading>
          </Flex>
        </NextLink>

        {/* Navigation Items - Right */}
        <HStack fontFamily="body" gap={6}>
          <HStack gap={3} display={{ base: 'none', md: 'flex' }}>
            {navigationItems.map((item) => {
              if (item.href === "/downloads" && !isAuthenticated) return null;
              const active = isActive(item.href);
              return (
                <Button key={item.href} fontSize="sm"
                  fontWeight="semibold"
                  colorPalette="orange"
                  size="sm"
                  px={2}
                  bg={active ? "orange.fg" : "transparent"}
                  color="orange.contrast"
                  variant="ghost"
                  asChild
                  _hover={{ bg: "orange.fg", color: "orange.subtle" }}
                >
                    <NextLink href={item.href}>
                      {item.icon}
                      {item.label}
                    </NextLink>
                </Button>
              );
            })}
            <Separator orientation="vertical" height="4" />
            <LanguageSwitcher />
            <Separator orientation="vertical" height="4" />
          </HStack>

          {/* Mobile hamburger menu */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Drawer.Root
              open={drawerOpen}
              onOpenChange={(details) => setDrawerOpen(details.open)}
              placement="end"
              size="xs"
            >
              <Drawer.Trigger asChild>
                <IconButton
                  aria-label="Open navigation menu"
                  variant="plain"
                  size="sm"
                  color="orange.contrast"
                >
                  <LuMenu />
                </IconButton>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop zIndex={zIndex.drawerBackdrop} />
                <Drawer.Positioner zIndex={zIndex.drawer}>
                  <Drawer.Content>
                    <Drawer.Header>
                      <Drawer.Title>{t('nav.menu')}</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <VStack align="stretch" gap={4} h="full">
                        {navigationItems.map((item) => {
                          if (item.href === "/downloads" && !isAuthenticated) return null;
                          return (
                          <Link
                            key={item.href}
                            fontSize="sm"
                            fontWeight={isActive(item.href) ? "bold" : "normal"}
                            color={isActive(item.href) ? "fg" : "fg.muted"}
                            asChild
                            _hover={{ textDecoration: "none", color: "fg" }}
                            onClick={() => setDrawerOpen(false)}
                          >
                            <NextLink href={item.href}>{item.icon}{item.label}</NextLink>
                          </Link>
                        )})}
                        <Separator mt="auto" />
                        <LanguageSwitcher />
                        <Separator />
                        <DropdownMenuItems onAction={() => setDrawerOpen(false)} />
                      </VStack>
                    </Drawer.Body>
                    <Drawer.CloseTrigger asChild>
                      <CloseButton size="sm" />
                    </Drawer.CloseTrigger>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          </Box>

          <Box display={{ base: "none", md: "block" }} mx={-3}>
            <DropdownMenu />
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
