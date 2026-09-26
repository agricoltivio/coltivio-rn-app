import { Button } from "@/components/buttons/Button";
import { Text } from "@/components/text/Text";
import i18n from "@/locales/i18n";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

// Rendered by Sentry.GlobalErrorBoundary for render errors and fatal JS errors.
// Sits outside the navigator, so it only relies on the theme and i18n instance.
export function GlobalErrorFallback({
  resetError,
}: {
  resetError: () => void;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing.l,
        gap: theme.spacing.m,
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ textAlign: "center", color: theme.colors.primary }}>
        {i18n.t("errors.unexpected")}
      </Text>
      <Button title={i18n.t("buttons.retry")} onPress={resetError} />
    </View>
  );
}
