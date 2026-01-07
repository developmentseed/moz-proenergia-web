import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Enforce semicolons
      "semi": ["error", "always"],
      // Enforce consistent JSX indentation (2 spaces)
      "react/jsx-indent": ["error", 2],
      "react/jsx-indent-props": ["error", 2],
      // Enforce spacing inside object curly braces
      "object-curly-spacing": ["error", "always"],
      // Disallow multiple spaces
      "no-multi-spaces": ["error"],
      // Disallow trailing whitespace at the end of lines
      "no-trailing-spaces": ["error"],
      // Limit multiple empty lines
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0, "maxBOF": 0 }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
