"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Heading, Flex, HStack, Text, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import Modal from "../chakra/modal";
import LoginForm from "./login-form";
import Image from "next/image";

export interface NavigationItem {
  label: string;
  href: string;
}

interface HeaderProps {
  logoSrc?: string;
  navigationItems?: NavigationItem[];
  modalContent?: React.ReactNode;
  modalTitle?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  { label: "Explorer", href: "/model/1" },
  { label: "Downloads", href: "/downloads" },
  { label: "About", href: "/about" },
  { label: "SDIDataPortal", href: "https://developmentseed.org" },
  { label: "Login", href: "modal" },
];

export const Header = ({
  logoSrc = "/Logo.svg",
  navigationItems = defaultNavigationItems,
}: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "modal") return false;
    // For /model/* paths, match any model page to Explorer
    if (href.startsWith("/model/") && pathname.startsWith("/model/"))
      return true;
    return pathname === href;
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href === "modal") {
      e.preventDefault();
      setIsModalOpen(true);
    }
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
            const isModal = item.href === "modal";
            if (isModal) {
              return (
                <Modal
                  key={item.href}
                  item={item}
                  modalTitle={"Log in"}
                  modalContent={<LoginForm />}
                />
              );
            }

            const active = isActive(item.href);
            return (
              <Box key={item.href}>
                <Link
                  fontSize="sm"
                  fontWeight={active ? "bold" : "medium"}
                  color={active ? "fg" : "#A1A1AA"}
                  transition="color 0.2s"
                  onClick={(e) => handleLinkClick(item.href, e)}
                  asChild
                >
                  <NextLink href={item.href}>{item.label}</NextLink>
                </Link>
              </Box>
            );
          })}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
