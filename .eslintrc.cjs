module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": [
      "warn",
      {
        trailingComma: "es6",
        printWidth: 120,
        endOfLine: 'auto',
      },
    ],

    "no-var": "error",
    "prefer-const": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  env: {
    browser: true,
    es2020: true,
  },
};
