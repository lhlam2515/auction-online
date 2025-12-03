import { config } from "@repo/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig(...config, {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
  },
});
