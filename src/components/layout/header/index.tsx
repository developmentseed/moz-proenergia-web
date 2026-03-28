"use client";

import { usePathname } from "next/navigation";
import { Box, Heading, Flex, HStack, Text, Link, Separator } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import DropdownMenu from "./dropdown-menu";
import { LanguageSwitcher } from "./language-switcher";
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
      bg="orange.600"
      color="orange.contrast"
      borderBottom="1px solid"
      borderBottomColor="panelBorder"
      px={3}
      pr={6}
      py={2}
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
              <Text display={{base: "inline", md: "none"}} as="span" color="orange.contrast" fontWeight="900">
                {t('nav.shortName')}
              </Text>
              <Text display={{base: "none", md: "inline"}} as="span" color="orange.contrast" fontWeight="900">
                {t('nav.longName')}
              </Text>
            </Heading>
          </Flex>
        </NextLink>

        {/* Navigation Items - Right */}
        <HStack fontFamily="body" gap={6}>
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
          <Separator orientation="vertical" height="4" />
          <DropdownMenu />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
