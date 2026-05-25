import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/build/**", "**/lambdaOutput/**", "**/node_modules/**", "**/coverage/**", "**/.turbo/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  }
);
