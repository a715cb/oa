import vuePlugin from "eslint-plugin-vue";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    ignores: ["dist/*", "node_modules/*", "*.min.js"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,vue}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      vue: vuePlugin,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...vuePlugin.configs["vue3-recommended"].rules,
      ...tsPlugin.configs.recommended.rules,
      ...prettierConfig.rules,
      "vue/script-setup-uses-vars": "error",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-empty-function": "off",
      "vue/custom-event-name-casing": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "space-before-function-paren": "off",
      "vue/attributes-order": "off",
      "vue/v-on-event-hyphenation": "off",
      "vue/multi-word-component-names": "off",
      "vue/one-component-per-file": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/max-attributes-per-line": "off",
      "vue/no-template-shadow": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/attribute-hyphenation": "off",
      "vue/require-default-prop": "off",
      "vue/html-indent": "off",
      "vue/comment-directive": "off",
      "vue/html-self-closing": "off",
      "prefer-const": ["error", {
        "destructuring": "all",
        "ignoreReadBeforeAssign": false
      }]
    },
  },
];
