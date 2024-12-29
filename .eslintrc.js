module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.js"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh", "@typescript-eslint"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "file",
        format: ["PascalCase"],
        filter: {
          regex: "^[A-Z][a-zA-Z0-9]*Page$",
          match: true,
        },
      },
    ],
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import/no-unresolved": "error",
    "import/case-sensitivity": "error",
  },
};
