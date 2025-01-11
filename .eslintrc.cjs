module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    // Only show critical TypeScript errors
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/ban-types": "error",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/triple-slash-reference": "error",

    // Critical React rules
    "react-hooks/rules-of-hooks": "error",
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],

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
  },
};
