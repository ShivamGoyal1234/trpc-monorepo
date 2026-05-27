import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      "react/prop-types": "off",
    },
  },
  {
    files: ["env.js", "middleware.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
    rules: {
      "turbo/no-undeclared-env-vars": "off",
    },
  },
];
