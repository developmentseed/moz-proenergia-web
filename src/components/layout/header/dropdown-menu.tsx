"use client";

import { Text, Button, MenuRoot, Menu, MenuTrigger, MenuContent, MenuItem, Box } from "@chakra-ui/react";
import Modal from "../../chakra/modal";
import LoginForm from "../login-form";
import { useAuth } from "@/utils/context/auth";
import { LuExternalLink, LuCircleUser } from "react-icons/lu";
import { controlZIndex } from "@/components/map/control-constant";

const DropdownMenu = () => {
  const { login, logout, isAuthenticated, username } = useAuth();

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
            ) : "Login"}
          </Button>
        </MenuTrigger>

        <Menu.Positioner >
          <MenuContent zIndex={controlZIndex + 2}>
            {isAuthenticated ? (
              <MenuItem value="logout" onClick={() => logout()} cursor={"pointer"}>
                Log out
              </MenuItem>
            ) : (
              <MenuItem value="login" cursor={"pointer"} onClick={() => {
                requestAnimationFrame(() => {
                  Modal.open("login-modal", {
                    modalTitle: "Log in",
                    modalContent: <LoginForm onSubmit={login} onClose={() => Modal.close("login-modal")} />
                  });
                });
              }}>
                Log in
              </MenuItem>
            )}
            <MenuItem value="sdi-portal" cursor={"pointer"} asChild>
              <a href="https://proenergia-staging.ds.io/admin/" target="_blank" rel="noopener noreferrer">
                SDI Portal <LuExternalLink />
              </a>
            </MenuItem>
          </MenuContent>
        </Menu.Positioner>
      </MenuRoot>
    </>
  );
};

export default DropdownMenu;
