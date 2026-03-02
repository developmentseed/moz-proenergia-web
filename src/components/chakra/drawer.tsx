"use client";

import { type ReactNode } from "react";
import { Button, CloseButton, Drawer, Portal } from "@chakra-ui/react";
import NextLink from "next/link";

interface ChakraDrawerProps {
  title: string;
  href: string;
  open: boolean;
  onOpenChange: (details: any) => void;
  triggerContent: ReactNode;
  drawerContent?: ReactNode;
}

export const ChakraDrawer = ({ href, title, open, onOpenChange, triggerContent, drawerContent }: ChakraDrawerProps) => {

  return (
    <Drawer.Root open={open} onOpenChange={(e) => onOpenChange(e.open)}>
      <Drawer.Trigger asChild>
        <Button variant="plain" size="sm">
          {triggerContent}
        </Button>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title> {title} </Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              {drawerContent}
            </Drawer.Body>
            <Drawer.Footer>
              <Button asChild>
                <NextLink href={href}>
                  Go to Explorer
                </NextLink>
              </Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
