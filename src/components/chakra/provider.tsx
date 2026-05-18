"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { system } from "./theme";
import { Toaster } from "./toaster";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ColorModeProvider defaultTheme="light" {...props}>
      <ChakraProvider value={system}>
        {props.children}
        <Toaster />
      </ChakraProvider>
    </ColorModeProvider>
  );
}
