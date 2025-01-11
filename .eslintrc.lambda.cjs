module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "commonjs",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-undef": "off", // Turn off no-undef since TypeScript handles this
    "@typescript-eslint/no-var-requires": "off", // Allow require statements
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "(^_|^decrypt.*$)", // Ignore variables starting with decrypt
      },
    ],
  },
  globals: {
    // Define Node.js global variables
    process: "readonly",
    Buffer: "readonly",
    __dirname: "readonly",
    __filename: "readonly",
    exports: "writable",
    module: "readonly",
    require: "readonly",
  },
};
