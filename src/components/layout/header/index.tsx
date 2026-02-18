"use client";

import { usePathname } from "next/navigation";
import { Box, Heading, Flex, HStack, Text, Link, Separator } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import DropdownMenu from "./dropdown-menu";

export interface NavigationItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logoSrc?: string;
  navigationItems?: NavigationItem[];
}

const defaultNavigationItems: NavigationItem[] = [
  { label: "Explorer", href: "/models" },
  { label: "About", href: "/about" },
  { label: "Downloads", href: "/downloads" },
];

export const Header = ({
  logoSrc = "/Logo.svg",
  navigationItems = defaultNavigationItems,
}: HeaderProps) => {
  const pathname = usePathname();

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
      bg="navBg"
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
              color="fg.muted"
            >
              Mozambique <br />
              <Text as="span" color="fg" fontWeight="900">
                Proenergia+ IEP
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
                  color={active ? "fg" : "fg.muted"}
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
          <DropdownMenu />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
