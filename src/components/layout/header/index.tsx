"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Heading, Flex, HStack, Text, Link, Separator, Drawer, CloseButton, IconButton, Portal, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import { LuMenu } from "react-icons/lu";
import DropdownMenu, { DropdownMenuItems } from "./dropdown-menu";
import { LanguageSwitcher } from "./language-switcher";
import { ColorModeButton } from "@/components/chakra/color-mode";
import { useTranslation } from "react-i18next";

export interface NavigationItem {
  label: string;
  href: string;
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

  const navigationItems: NavigationItem[] = [
    { label: t('nav.explorer'), href: "/models" },
    { label: t('nav.about'), href: "/about" },
    { label: t('nav.downloads'), href: "/downloads" },
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
      bg="orange.solid"
      color="orange.contrast"
      borderBottom="1px solid"
      borderBottomColor="border.subtle"
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
          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Box key={item.href}>
                  <Link
                    fontSize="sm"
                    fontWeight={active ? "bold" : "medium"}
                    color="orange.contrast"
                    transition="color 0.2s"
                    asChild
                    _hover={{ textDecoration: "none", outline: "none" }}
                  >
                    <NextLink href={item.href}>{item.label}</NextLink>
                  </Link>
                </Box>
              );
            })}
            <Separator orientation="vertical" height="4" />
            <LanguageSwitcher />
            <ColorModeButton color="orange.contrast" />
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
                  color="fg.muted"
                >
                  <LuMenu />
                </IconButton>
              </Drawer.Trigger>
              <Portal>
                <Drawer.Backdrop zIndex={1700} />
                <Drawer.Positioner zIndex={1800}>
                  <Drawer.Content>
                    <Drawer.Header>
                      <Drawer.Title>{t('nav.menu')}</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <VStack align="stretch" gap={4} h="full">
                        {navigationItems.map((item) => (
                          <Link
                            key={item.href}
                            fontSize="sm"
                            fontWeight={isActive(item.href) ? "bold" : "medium"}
                            color={isActive(item.href) ? "fg" : "fg.muted"}
                            asChild
                            _hover={{ textDecoration: "none", color: "fg" }}
                            onClick={() => setDrawerOpen(false)}
                          >
                            <NextLink href={item.href}>{item.label}</NextLink>
                          </Link>
                        ))}
                        <Separator mt="auto" />
                        <LanguageSwitcher />
                        <ColorModeButton alignSelf="flex-start" />
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

          <Box display={{ base: "none", md: "block" }}>
            <DropdownMenu />
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
