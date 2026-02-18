"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Box, Heading, Flex, HStack, Text, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import Modal from "../chakra/modal";
import LoginForm from "./login-form";
import { useAuth } from "@/utils/context/auth";
import LogoutButton from "../ui/logout-button";
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
  { label: "Explorer", href: "/models" },
  { label: "About", href: "/about" },
  { label: "Downloads", href: "/downloads" },
  { label: "SDI Admin", href: "https://proenergia-staging.ds.io/admin/" },
  { label: "Login", href: "modal" },
];

export const Header = ({
  logoSrc = "/Logo.svg",
  navigationItems = defaultNavigationItems,
}: HeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const { login, isAuthenticated } = useAuth();

  // To show successful logout message
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "modal") return false;
    // For /model/* paths, match any model page to Explorer
    if (href.startsWith("/models") && pathname.startsWith("/model/"))
      return true;
    return pathname === href + "/";
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    if (href === "modal") {
      e.preventDefault();
    }
  };
  const onModalClose = () => {
      setIsModalOpen(false);
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
              if ((isAuthenticated || loggingOut) && !isModalOpen) {
                return (
                  <LogoutButton
                    key={item.href}
                    onLogoutStart={() => setLoggingOut(true)}
                    onLogoutEnd={() => setLoggingOut(false)}
                  />
                );
              }
              return (
                <Modal
                  key={item.href}
                  isOpen={isModalOpen}
                  item={item}
                  modalTitle={"Log in"}
                  setIsModalOpen={setIsModalOpen}
                  modalContent={<LoginForm onSubmit={login} onClose={onModalClose} />}
                />
              );
            }
            const active = isActive(item.href);
            return (
              <Box key={item.href}>
                <Link
                  fontSize="sm"
                  fontWeight={active ? "bold" : "medium"}
                  color={active ? "fg" : "fg.muted"}
                  transition="color 0.2s"
                  onClick={(e) => handleLinkClick(item.href, e)}
                  asChild
                  _hover={{ textDecoration: "none", outline: "none" }}
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
