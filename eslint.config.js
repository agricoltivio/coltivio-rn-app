// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // styled-components uses 'styled' as both default and named export — this is intentional
      "import/no-named-as-default": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "none",
          ignoreRestSiblings: true,
          caughtErrors: "all",
        },
      ],
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
    // The one place allowed to import react-native's Text directly, since it wraps it.
    files: ["components/text/Text.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);
