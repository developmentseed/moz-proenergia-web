"use client";

import { ChakraProvider, createSystem, defineTextStyles, defaultConfig } from "@chakra-ui/react";
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode";

// Text style sets

export const textStyles = defineTextStyles({
  subTitle: {
    description: 'Small text that comes above the model title',
    value: {
        color: "#52525B",
        fontFamily: "var(--font-dm-mono)",
        fontSize: "0.75rem",
        fontWeight: 400,
        letterSpacing: "1.2px",
        textTransform: 'uppercase'
    }
  },
  modelTitle: {
    description: 'big text for model title, analysis title',
    value: {
      color: '#000',
      fontFamily: "var(--font-dm-sans)",
      fontSize: '1.5rem',
      fontWeight: 900,
      lineHeight: '2rem'
    }
  },
  collapsibleGroupTitle: {
    description: "Title for collapsible area",
    value: {
      fontFamily: "var(--font-dm-sans)",
      color: "#000",
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: "1.75rem"
    },
  },
  allCapLabel: {
    description: "All Cap Labels for filters",
    value: {
      fontFamily: "var(--font-dm-mono)",
      color: "#0A0A0C",
      fontWeight: 300,
      textTransform: "uppercase"
    },
  },
  sliderLabel: {
    description: "labe for text range sliders",
    value: {
    color: "#000",
      fontFamily: "var(--font-dm-mono)",
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.25rem"
    }
  },
  checkboxOption: {
    description: "options for checkbox",
    value: {
      color: "#000",
      fontFamily: "var(--font-dm-sans)",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: "1rem"
    }
  },
  rangeValue: {
    description: "text to display range slider value",
    value: {
      color: "#52525B",
      fontFamily: "var(--font-dm-mono)",
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: "1rem"
    }
  },
  tableAttr: {
    description: "table attribution name",
    value: {
      color: '#000',
      fontFamily:  "var(--font-dm-sans)",
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: '0.85rem'
    }
  },
  tableValue: {
    description: "table value",
    value: {
            color: '#52525b',
      fontFamily:  "var(--font-dm-sans)",
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '0.85rem'
    }
  }
});

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-dm-mono)" },
        body: { value: "var(--font-dm-sans)" },
      },
    },
    textStyles
  },
});

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      {props.children}
      {/* <ColorModeProvider {...props} /> */}
    </ChakraProvider>
  );
}
