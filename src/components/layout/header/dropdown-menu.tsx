"use client";

import { Text, Button, MenuRoot, Menu, MenuTrigger, MenuContent, MenuItem, Box } from "@chakra-ui/react";
import Modal from "../../chakra/modal";
import LoginForm from "../login-form";
import { useAuth } from "@/utils/context/auth";
import { LuExternalLink, LuCircleUser } from "react-icons/lu";
import { controlZIndex } from "@/components/map/control-constant";
import { SDI_PORTAL_URL } from "@/config/website";
import { useTranslation } from "react-i18next";

const DropdownMenu = () => {
  const { login, logout, isAuthenticated, username } = useAuth();
  const { t } = useTranslation();

  return (
    <>
      <Modal.Viewport />
      <MenuRoot>
        <MenuTrigger asChild>
          <Button
            variant="plain"
            padding={0}
            pl={1}
            pr={1}
            fontSize="sm"
            fontWeight="medium"
            color="fg.muted"
            gap={1.5}
          >
            {isAuthenticated && username ? (
              <Box display={"flex"} gap="1">
                <LuCircleUser />
                <Text maxW="80px" truncate>{username}</Text>
              </Box>
            ) : t('nav.login')}
          </Button>
        </MenuTrigger>

        <Menu.Positioner >
          <MenuContent zIndex={controlZIndex + 2}>
            {isAuthenticated ? (
              <MenuItem value="logout" onClick={() => logout()} cursor={"pointer"}>
                {t('nav.logout')}
              </MenuItem>
            ) : (
              <MenuItem value="login" cursor={"pointer"} onClick={() => {
                requestAnimationFrame(() => {
                  Modal.open("login-modal", {
                    modalTitle: t('auth.login.title'),
                    modalContent: <LoginForm onSubmit={login} onClose={() => Modal.close("login-modal")} />
                  });
                });
              }}>
                {t('nav.login')}
              </MenuItem>
            )}
            <MenuItem value="sdi-portal" cursor={"pointer"} asChild>
              <a href={SDI_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                <LuExternalLink /> {t('nav.sdiPortal')}
              </a>
            </MenuItem>
          </MenuContent>
        </Menu.Positioner>
      </MenuRoot>
    </>
  );
};

export default DropdownMenu;
