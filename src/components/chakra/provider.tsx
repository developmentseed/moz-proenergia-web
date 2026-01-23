"use client";

import { ChakraProvider, createSystem, defineTextStyles, defaultConfig } from "@chakra-ui/react";
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode";
import { system } from "./theme";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      {props.children}
      {/* <ColorModeProvider {...props} /> */}
    </ChakraProvider>
  );
}
