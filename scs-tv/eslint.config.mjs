import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/typescript"),
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "off", // Globally disable the rule
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // disable no const 
      "@typescript-eslint/no-const-enum": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // disable never reassigned use const 
      "@typescript-eslint/no-reassign": "off",
      // disable prefer const 
      "@typescript-eslint/prefer-const": "off",
      // turn off ts-ignore
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-expect-error": "allow-with-description",
          "ts-nocheck": "allow-with-description",
          "ts-check": false,
        },
      ],
    },
  },
];

export default eslintConfig;