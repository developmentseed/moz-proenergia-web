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
      fontWeight: 400,
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
        orange: {
          50:  { value: "#FEF6EE" },
          100: { value: "#FDEBD8" },
          200: { value: "#FAD5B0" },
          300: { value: "#F6B07B" },
          400: { value: "#F08040" },
          500: { value: "#E06618" },
          600: { value: "#CC5500" },
          700: { value: "#A34300" },
          800: { value: "#7A3300" },
          900: { value: "#522200" },
          950: { value: "#2E1300" },
        },
      }
    },
    textStyles,
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: {
            value: { _light: "{colors.white}", _dark: "#201a15" }, // Custom dark background
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "#1d1c1b" }, // Custom dark subtle background
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "#404040" }, // Custom dark muted background
          },
        },
        fg: {
          DEFAULT: {
            value: { _light: "{colors.black}", _dark: "#e4e4e4" }, // Custom dark text color
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "#a3a3a3" }, // Custom dark muted text
          },
        },
        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "#373737" }, // Custom dark border
          },
        },
      }, 
    },
  },
});