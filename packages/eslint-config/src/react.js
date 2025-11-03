import { config as baseConfig } from "./base.js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

/**
 * An ESLint configuration object tailored for React projects.
 *
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  ...baseConfig,
  react.configs.flat.recommended,
  {
    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Additional React-specific rules can be added here
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
    },
  },
];
