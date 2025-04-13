import { queryKeys } from "@/cache/query-keys";
import { ContentView } from "@/components/containers/ContentView";
import { UnexpectedErrorScreenProps } from "@/navigation/rootStackTypes";
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

  useEffect(() => {
    const listener = AppState.addEventListener("change", (status) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users._def });
    });

    return () => listener.remove();
  }, []);
  return (
    <ContentView>
      <H1>{t("errors.unexpected")}</H1>
      <H3 style={{ marginTop: theme.spacing.l }}>
        {t("errors.try_again_later")}
      </H3>
    </ContentView>
  );
}
