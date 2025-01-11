module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
    tsconfigRootDir: ".",
  },
  plugins: ["react-refresh", "@typescript-eslint", "react-hooks", "react"],
  settings: {
    react: {
      version: "18.2.0",
    },
  },
  rules: {
    // Critical TypeScript errors that could cause runtime issues
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-explicit-any": "warn", // Downgraded to warning

    // Remove overly strict type checking rules
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",

    // Critical React rules
    "react-hooks/rules-of-hooks": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "error",
    "react/no-children-prop": "error",
    "react/no-danger": "error",
    "react/no-deprecated": "error",

    // Critical runtime errors
    "no-debugger": "error",
    "no-dupe-args": "error",
    "no-dupe-keys": "error",
    "no-duplicate-case": "error",
    "no-empty-pattern": "error",
    "no-ex-assign": "error",
    "no-func-assign": "error",
    "no-obj-calls": "error",
    "no-unreachable": "error",
    "use-isnan": "error",

    // More lenient unused vars rule
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "(^_|^React$)", // Allow React import to be unused
        ignoreRestSiblings: true,
      },
    ],

    // Turn off non-critical rules
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "react-refresh/only-export-components": "off",
    "react/no-unescaped-entities": "off", // Turn off unescaped entities warning
  },
};
