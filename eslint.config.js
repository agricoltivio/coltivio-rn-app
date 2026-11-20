// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Build output, generated types and native projects
    ignores: ["dist/*", ".expo/*", "ios/*", "android/*"],
  },
  {
    rules: {
      // styled-components uses 'styled' as both default and named export — this is intentional
      "import/no-named-as-default": "off",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["Text"],
              message:
                "Import Text from '@/components/text/Text' instead — it applies the app's Inter font.",
            },
          ],
        },
      ],
    },
  },
  {
    // eslint-config-expo registers the @typescript-eslint plugin only for TS files.
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "none",
          ignoreRestSiblings: true,
          caughtErrors: "all",
        },
      ],
    },
  },
  {
    // The one place allowed to import react-native's Text directly, since it wraps it.
    files: ["components/text/Text.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // Node scripts (release, translations)
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: { __dirname: "readonly" },
    },
  },
]);
