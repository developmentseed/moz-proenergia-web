"use client";

import { Text, Button, Link, MenuRoot, Menu, MenuTrigger, MenuContent, MenuItem, Box } from "@chakra-ui/react";
import Modal from "../../chakra/modal";
import LoginForm from "../login-form";
import { useAuth } from "@/utils/context/auth";
import { LuExternalLink, LuCircleUserRound, LuLogOut, LuLogIn } from "react-icons/lu";
import { zIndex } from "@/components/ui/constant";
import { SDI_PORTAL_BASE_URL } from "@/config/website";
import { useTranslation } from "react-i18next";

const DropdownMenu = () => {
  const { login, logout, isAuthenticated, username } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("pt") ? "pt" : "en";
  const adminURL = `${SDI_PORTAL_BASE_URL}${lang}/admin/`;

  return (
    <>
      <Modal.Viewport />
      <MenuRoot>
        <MenuTrigger asChild>
          <Button
            variant="plain"
            colorPalette="orange"
            size="sm"
            gap={1.5}
            fontWeight="semibold"
            px={1.5}
            _hover={{ bg: "orange.fg", color: "orange.subtle" }}
            color="inherit"
          >
            {isAuthenticated && username ? (
              <>
                <LuCircleUserRound size={20} />
                <Text maxW="80px" truncate>{username}</Text>
              </>
            ) : <>
              <LuLogIn />
              {t('nav.login')}
            </> }
          </Button>
        </MenuTrigger>

        <Menu.Positioner >
          <MenuContent zIndex={zIndex.menu}>
            {isAuthenticated ? (
              <MenuItem value="logout" onClick={() => logout()} cursor={"pointer"}>
                <LuLogOut />
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
                <LuLogIn />
                {t('nav.login')}
              </MenuItem>
            )}
            <MenuItem value="sdi-portal" cursor={"pointer"} asChild>
              <a href={adminURL} target="_blank" rel="noopener noreferrer">
                <LuExternalLink /> {t('nav.sdiPortal')}
              </a>
            </MenuItem>
          </MenuContent>
        </Menu.Positioner>
      </MenuRoot>
    </>
  );
};

export const DropdownMenuItems = ({ onAction }: { onAction?: () => void }) => {
  const { login, logout, isAuthenticated, username } = useAuth();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("pt") ? "pt" : "en";
  const adminURL = `${SDI_PORTAL_BASE_URL}${lang}/admin/`;

  const openLoginModal = () => {
    onAction?.();
    requestAnimationFrame(() => {
      Modal.open("login-modal", {
        modalTitle: t('auth.login.title'),
        modalContent: <LoginForm onSubmit={login} onClose={() => Modal.close("login-modal")} />,
      });
    });
  };

  return (
    <>
      {isAuthenticated ? (
        <Button
          variant="plain"
          padding={0}
          fontSize="sm"
          fontWeight="medium"
          color="fg.muted"
          justifyContent="flex-start"
          onClick={() => logout()}
        >
          {t('nav.logout')}
        </Button>
      ) : (
        <Button
          variant="plain"
          padding={0}
          fontSize="sm"
          fontWeight="medium"
          color="fg.muted"
          justifyContent="flex-start"
          onClick={openLoginModal}
        >
          {username ? (
            <Box display="flex" gap="1" alignItems="center">
              <LuCircleUserRound size={20} />
              <Text maxW="80px" truncate>{username}</Text>
            </Box>
          ) : t('nav.login')}
        </Button>
      )}
      <Link
        fontSize="sm"
        fontWeight="medium"
        color="fg.muted"
        href={adminURL}
        target="_blank"
        rel="noopener noreferrer"
        display="flex"
        alignItems="center"
        gap={1.5}
        _hover={{ textDecoration: "none", color: "fg" }}
      >
        <LuExternalLink /> {t('nav.sdiPortal')}
      </Link>
    </>
  );
};

export default DropdownMenu;
