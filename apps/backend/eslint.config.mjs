import { config } from "@repo/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig({
  ...config,
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
      node: true,
    },
  },
});
