import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: false
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    ignores: ["out/**", "node_modules/**"]
  }
);
