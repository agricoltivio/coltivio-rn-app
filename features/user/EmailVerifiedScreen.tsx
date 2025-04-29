import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Body, H3 } from "@/theme/Typography";
import { useUrl } from "@/utils/url-context";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { EmailVerifiedScreenProps } from "./navigation/user-routes";
import { useUpdateUserMutation } from "./users.hooks";

export function EmailVerifiedScreen({ navigation }: EmailVerifiedScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

  const updateUserMutation = useUpdateUserMutation();

  const { url } = useUrl();
  useEffect(() => {
    const verifyEmailFromUrl = async () => {
      if (!url) {
        return;
      }
      const { queryParams } = Linking.parse(url.replaceAll("#", "?"));
      if (!queryParams) {
        setError(t("errors.unexpected"));
        return;
      }
      if (queryParams.error) {
        switch (queryParams.error) {
          case "access_denied":
            setError(t("errors.link_expired"));
            break;
          default: {
            setError(t("errors.unexpected"));
          }
        }
        console.error(queryParams.error);
        return;
      }
      const { access_token, refresh_token } = queryParams;
      if (!access_token || !refresh_token) {
        console.error(
          "Missing access_token or refresh_token",
          access_token != null,
          refresh_token != null
        );
        setError(t("errors.unexpected"));
        return;
      } else {
        updateUserMutation.mutate({ emailVerified: true });
      }
    };
    verifyEmailFromUrl();
  }, [url]);

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={() => navigation.reset({ routes: [{ name: "Home" }] })}
            title={t("buttons.finish")}
          />
        </BottomActionContainer>
      }
    >
      <View
        style={{
          borderRadius: 10,
          backgroundColor: error ? theme.colors.danger : theme.colors.success,
          opacity: 0.7,
          marginTop: theme.spacing.m,
          padding: theme.spacing.m,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Body style={{ fontWeight: 800, color: "white" }}>
          {error ? error : t("users.email_verified")}
        </Body>
      </View>
    </ContentView>
  );
}
