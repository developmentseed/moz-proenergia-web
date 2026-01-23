import { createSystem, defaultConfig, defineConfig, defineTextStyles } from "@chakra-ui/react";
// Text style sets

export const textStyles = defineTextStyles({
  subTitle: {
    description: 'Small text that comes above the model title',
    value: {
        color: "fg.muted",
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
      color: 'text.fg',
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
      color: "text.fg",
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: "1.75rem"
    },
  },
  allCapLabel: {
    description: "All Cap Labels for filters",
    value: {
      fontFamily: "var(--font-dm-mono)",
      color: "gray.fg",
      fontWeight: 300,
      textTransform: "uppercase"
    },
  },
  sliderLabel: {
    description: "labe for text range sliders",
    value: {
      color: "text.fg",
      fontFamily: "var(--font-dm-sans)",
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: "1.25rem"
    }
  },
  sliderTextLabel: {
    description: "labe for text input in text range sliders",
    value: {
    color: "text.fg",
      fontFamily: "var(--font-dm-mono)",
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.25rem"
    }
  },
  checkboxOption: {
    description: "options for checkbox",
    value: {
      color: "text.fg",
      fontFamily: "var(--font-dm-sans)",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: "1rem"
    }
  },
  rangeValue: {
    description: "text to display range slider value",
    value: {
      color: "fg.muted",
      fontFamily: "var(--font-dm-mono)",
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: "1rem"
    }
  },
  tableAttr: {
    description: "table attribution name",
    value: {
      color: 'text.fg',
      fontFamily:  "var(--font-dm-sans)",
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: '0.85rem'
    }
  },
  tableValue: {
    description: "table value",
    value: {
      color: 'fg.muted',
      fontFamily:  "var(--font-dm-sans)",
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: '0.85rem'
    }
  }
});

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-dm-mono)" },
        body: { value: "var(--font-dm-sans)" },
      },
      colors: {
        navBg: { value: "{colors.bg.emphasized}" },
        panelBg: { value: "{colors.bg.muted}" },
        panelBorder: { value: "{colors.border.emphasized}" },
        uiPoint: { value: "{colors.yellow.muted}" },
      }
    },
    textStyles
  },
});