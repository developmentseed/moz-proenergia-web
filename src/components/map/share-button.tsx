"use client";

import { useState } from "react";
import {
  Clipboard,
  IconButton,
  Input,
  InputGroup,
  Button,
  Menu,
  Portal,
} from "@chakra-ui/react";
import { LuShare } from "react-icons/lu";

const ShareButton = () => {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const [isCopied, setIsCopied] = useState(false);

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
          size="xs"
          bg="bg"
          _hover={{ bg: "bg.subtle" }}
          variant="surface"
          position="absolute"
          h="2.125rem"
          top="calc(1rem + 1px)"
          right={12}
          fontFamily="body"
        >
          Share
          <LuShare />
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Clipboard.Root
              maxW="300px"
              value={currentUrl}
              px={3}
              py={2}
              onStatusChange={(details) => {
                if (details.copied) {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 3025);
                }
              }}
            >
              <Clipboard.Label textStyle="label">Share link</Clipboard.Label>
              <InputGroup
                endElement={
                  <Clipboard.Trigger asChild>
                    <IconButton variant="surface" size="xs" me="-2">
                      <Clipboard.Indicator />
                    </IconButton>
                  </Clipboard.Trigger>
                }
              >
                <Input readOnly value={isCopied ? "URL copied" : currentUrl} />
              </InputGroup>
            </Clipboard.Root>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default ShareButton;
