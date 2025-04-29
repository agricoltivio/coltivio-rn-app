import { useSession } from "@/auth/SessionProvider";
import { queryKeys } from "@/cache/query-keys";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { UnexpectedErrorScreenProps } from "./navigation/error-routes";
import { H1, H3 } from "@/theme/Typography";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";
import { useTheme } from "styled-components/native";

export function UnexpectedErrorScreen({}: UnexpectedErrorScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { clearSession } = useSession();

  useEffect(() => {
    const listener = AppState.addEventListener("change", (status) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users._def });
    });

    return () => listener.remove();
  }, []);
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            style={{ marginTop: theme.spacing.l }}
            type="secondary"
            title={t("buttons.signout")}
            onPress={() => {
              clearSession();
              queryClient.removeQueries();
            }}
          />
        </BottomActionContainer>
      }
    >
      <H1>{t("errors.unexpected")}</H1>
      <H3 style={{ marginTop: theme.spacing.l }}>
        {t("errors.try_again_later")}
      </H3>
    </ContentView>
  );
}
