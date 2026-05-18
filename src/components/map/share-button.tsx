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
import { useTranslation } from "react-i18next";

const ShareButton = () => {
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

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
          top={{base: 12, md: 4}}
          right={{base: 2, md: 12}}
          fontFamily="body"
        >
          {t('map.share')}
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
              <Clipboard.Label textStyle="label">{t('map.shareLink')}</Clipboard.Label>
              <InputGroup
                endElement={
                  <Clipboard.Trigger asChild>
                    <IconButton variant="surface" size="xs" me="-2">
                      <Clipboard.Indicator />
                    </IconButton>
                  </Clipboard.Trigger>
                }
              >
                <Input readOnly value={isCopied ? t('map.urlCopied') : currentUrl} />
              </InputGroup>
            </Clipboard.Root>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default ShareButton;
