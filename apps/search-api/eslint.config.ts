import path from "path";
import { fileURLToPath } from "url";

import { defineConfig } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import { importX } from "eslint-plugin-import-x";
import globals from "globals";

const eslintConfigDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  // --- presets ---
  stylistic.configs.recommended,
  tseslint.configs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- import-x flatConfig types don't match defineConfig's LanguageOptions
  importX.flatConfigs.recommended as any,
  importX.flatConfigs.typescript as any,
  {
    files: ['**/*.{tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: eslintConfigDir,
      },
      globals: {
        ...globals.node,
        ...globals.es2025
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@stylistic/semi": ["error", "always", { omitLastInOneLineBlock: true, omitLastInOneLineClassBody: true }],
      "@stylistic/eol-last": "off",
      "import-x/no-dynamic-require": "warn",
      "import-x/no-nodejs-modules": "off",
    },
  },
  // --- ignores ---
  {
    ignores: [
      "dist",
      "lambdaOutput",
      "node_modules",
      "coverage",
      "eslint.config.js",
      "eslint.config.ts"
    ]
  },

  // --- rules for your source files ---
  {
    files: ["src/**/*.ts", "scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: eslintConfigDir,
      },
    },
    settings: {
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          project: path.join(eslintConfigDir, "tsconfig.eslint.json"),
          alwaysTryTypes: true,
        }),
      ],
    },
    rules: {
      // --- stylistic rules ---
      "@stylistic/semi": ["error", "always", { omitLastInOneLineBlock: true, omitLastInOneLineClassBody: true }],
      "@stylistic/eol-last": "off",
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/arrow-parens": ["error", "as-needed"],
      "@stylistic/comma-dangle": ["error", "never"],
      "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/space-before-function-paren": ["error", "never"],
      "@stylistic/padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "*", next: "block" },
        { blankLine: "always", prev: "for", next: "*" },
        { blankLine: "always", prev: "*", next: "for" },
        { blankLine: "always", prev: "if", next: "*" },
        { blankLine: "always", prev: "*", next: "if" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"]
        },
        { blankLine: "always", prev: "export", next: "*" },
        { blankLine: "never", prev: "export", next: "export" },
        { blankLine: "always", prev: "function", next: "*" },
        { blankLine: "always", prev: "*", next: "function" },
        { blankLine: "always", prev: "*", next: "export" }
      ],
      "@stylistic/padded-blocks": ["error", "never"],
      "@stylistic/lines-between-class-members": [
        "error",
        {
          enforce: [
            { blankLine: "always", prev: "method", next: "field" },
            { blankLine: "always", prev: "field", next: "method" },
            { blankLine: "always", prev: "method", next: "method" },
            { blankLine: "never", prev: "field", next: "field" }
          ]
        }
      ],

      // --- general best practices ---
      "no-duplicate-imports": ["error", { includeExports: true }],
      "no-console": [
        "error",
        { allow: ["warn", "error", "info", "time", "timeEnd"] }
      ],
      "@stylistic/curly-newline": ["error", { minElements: 1 }],
      "prefer-const": "error",
      "no-debugger": "warn",
      "no-var": "error",
      "no-control-regex": "off",
      "max-lines": ["warn", { max: 500 }],
      "max-params": ["error", 2],

      // --- TypeScript rules ---
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false }
      ],
      "@typescript-eslint/promise-function-async": "error",

      // --- misc ---
      "capitalized-comments": [
        "warn",
        "always",
        { ignoreConsecutiveComments: true }
      ],

      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true }
        }
      ]
    }
  }
]);
