import { Button } from "@/components/buttons/Button";
import { Text } from "@/components/text/Text";
import { H2 } from "@/theme/Typography";
import * as Sentry from "@sentry/react-native";
import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

// Catches render errors of one screen: only that screen shows the fallback, the
// navigation and the rest of the app keep working. Sentry gets the error with the
// component stack.
export function ScreenErrorBoundary({
  children,
  onGoBack,
}: {
  children: ReactNode;
  // Missing on the first screen of the stack, there is nothing to go back to
  onGoBack?: () => void;
}) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <ScreenErrorFallback onRetry={resetError} onGoBack={onGoBack} />
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

function ScreenErrorFallback({
  onRetry,
  onGoBack,
}: {
  onRetry: () => void;
  onGoBack?: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: theme.spacing.l,
        gap: theme.spacing.m,
        backgroundColor: theme.colors.background,
      }}
    >
      <H2>{t("errors.unexpected")}</H2>
      <Text>{t("errors.screen_error_hint")}</Text>
      <View style={{ gap: theme.spacing.s, marginTop: theme.spacing.m }}>
        {onGoBack && (
          <Button type="primary" title={t("buttons.back")} onPress={onGoBack} />
        )}
        <Button
          type={onGoBack ? "secondary" : "primary"}
          title={t("buttons.retry")}
          onPress={onRetry}
        />
      </View>
    </View>
  );
}
