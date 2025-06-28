// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";

export default [
  // --- Base JS rules
  js.configs.recommended,

  // --- TS rules
  {
    ignores: ["dist"],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },
    extends: [
      // come after parser setup
      "plugin:@typescript-eslint/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
    ],
    rules: {
      // --- TS-specific dead-code detection
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",

      // --- Generic JS dead-code/risky rules
      "no-unreachable-code": "error",
      "no-unused-expressions": "error",

      // --- Import/export cleanup
      "import/no-unused-modules": [
        "warn",
        { 
          unusedExports: true,
          src: ["src/**/*.{ts,tsx,js,jsx}"]
        }
      ],

      // --- React hooks & refresh from before
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
