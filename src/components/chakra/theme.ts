import { createSystem, defaultConfig, defineConfig, defineTextStyles } from "@chakra-ui/react";
// Text style sets

export const textStyles = defineTextStyles({
  subTitle: {
    description: 'Small text that comes above the model title',
    value: {
        color: "fg.muted",
        fontFamily: "mono",
        fontSize: "xs",
        fontWeight: 400,
        letterSpacing: "0.8px",
        textTransform: 'uppercase'
    }
  },
  modelTitle: {
    description: 'big text for model title, analysis title',
    value: {
      color: 'fg',
      fontFamily: "body",
      fontSize: "xl",
      fontWeight: 600,
      lineHeight: '2rem'
    }
  },
  collapsibleGroupTitle: {
    description: "Title for collapsible area",
    value: {
      fontFamily: "body",
      color: "fg",
      fontSize: "sm",
      fontWeight: 600,
    },
  },
  allCapLabel: {
    description: "All Cap Labels for filters",
    value: {
      fontFamily: "mono",
      color: "fg.muted",
      fontWeight: 300,
      fontSize: "xs",
      letterSpacing: "0.8px",
      textTransform: "uppercase"
    },
  },
  sliderLabel: {
    description: "label for text range sliders",
    value: {
      color: "fg",
      fontFamily: "body",
      fontSize: "sm",
      fontWeight: 600,
    }
  },
  sliderTextLabel: {
    description: "label for text input in text range sliders",
    value: {
    color: "fg",
      fontFamily: "mono",
      fontSize: "xs",
      fontWeight: 400,
      lineHeight: "1.25rem"
    }
  },
  checkboxOption: {
    description: "options for checkbox",
    value: {
      color: "fg",
      fontFamily: "body",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: "1rem"
    }
  },
  rangeValue: {
    description: "text to display range slider value",
    value: {
      color: "fg.muted",
      fontFamily: "mono",
      fontSize: "xs",
      fontWeight: 400,
      lineHeight: "1rem"
    }
  },
  tableAttr: {
    description: "table attribution name",
    value: {
      color: 'fg',
      fontFamily:  "body",
      fontSize: "xs",
      fontWeight: 600,
      lineHeight: '0.85rem'
    }
  },
  tableValue: {
    description: "table value",
    value: {
      color: 'fg.muted',
      fontFamily:  "body",
      fontSize: "xs",
      fontWeight: 400,
      lineHeight: '0.85rem'
    }
  }
});

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "var(--font-dm-sans)" },
        body: { value: "var(--font-dm-sans)" },
        mono: { value: "var(--font-dm-mono)" },
      },
      colors: {
        navBg: { value: "{colors.bg.subtle}" },
        panelBg: { value: "{colors.bg}" },
        panelBorder: { value: "{colors.border.emphasized}" },
      }
    },
    textStyles
  },
});