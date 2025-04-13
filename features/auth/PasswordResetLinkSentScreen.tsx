import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useUserQuery } from "../user/users.hooks";
import { PasswordResetLinkSentScreenProps } from "@/navigation/rootStackTypes";

export function PasswordResetLinkSentScreen({
  navigation,
}: PasswordResetLinkSentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: "SignIn" }],
              })
            }
            title={t("buttons.finish")}
          />
        </BottomActionContainer>
      }
    >
      <H3 style={{ marginTop: theme.spacing.xl }}>
        {t("forgot_password.reset_link_sent", { email: user?.email })}
      </H3>
      <H3 style={{ marginTop: theme.spacing.m }}>
        {t("forgot_password.mail_being_deliverd")}
      </H3>
      <H3 style={{ marginTop: theme.spacing.m }}>
        {t("common.if_problem_contact_support")}
      </H3>
    </ContentView>
  );
}
