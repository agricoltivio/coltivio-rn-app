import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { H2, H3 } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { ChangeEmailPendingScreenProps } from "./navigation/user-routes";

export function ChangeEmailPendingScreen({
  navigation,
}: ChangeEmailPendingScreenProps) {
  const { t } = useTranslation();

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
      <H2>{t("users.email_change_pending")}</H2>
      <H3>{t("users.email_change_verification_sent")}</H3>
    </ContentView>
  );
}
