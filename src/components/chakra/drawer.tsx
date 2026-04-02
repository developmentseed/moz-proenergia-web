"use client";

import { type ReactNode } from "react";
import { Button, CloseButton, Drawer, Portal } from "@chakra-ui/react";

interface ChakraDrawerProps {
  title: string;
  open: boolean;
  onOpenChange: (details: any) => void;
  triggerContent?: ReactNode;
  drawerContent?: ReactNode;
  drawerFooterContent?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
}

export const ChakraDrawer = ({
  title,
  open,
  onOpenChange,
  triggerContent,
  drawerContent,
  drawerFooterContent,
  size = "md",
}: ChakraDrawerProps) => {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={size}
    >
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
            <Drawer.Body>{drawerContent}</Drawer.Body>
            {drawerFooterContent && (
              <Drawer.Footer>{drawerFooterContent}</Drawer.Footer>
            )}
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
