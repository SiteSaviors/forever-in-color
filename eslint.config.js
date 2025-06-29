import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "*.config.js",
      "*.config.ts",
    ],
  },
  {
    // pull in the core ESLint + TS rules
    extends: [
      js.configs.recommended,                // eslint:recommended
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
      "plugin:unused-imports/recommended",
    ],

    // tell import/resolver about TS paths
    settings: {
      "import/resolver": {
        typescript: {},
      },
    },

    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },

    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
      import: importPlugin,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      //
      // Unused‐vars & imports
      //
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      //
      // **NEW** detect exported-but-never-used modules
      //
      "import/no-unused-modules": [
        "error",
        {
          unusedExports: true,
          src: ["src/**/*.ts", "src/**/*.tsx"],
        },
      ],

      //
      // Other dead‐code‐related rules
      //
      "no-unreachable": "error",
      "no-unreachable-loop": "error",
      "no-unused-expressions": "error",
      "no-unused-labels": "error",
      "no-useless-assignment": "error",
    },
  }
);

