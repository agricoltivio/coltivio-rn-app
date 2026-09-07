import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { BrandedContentView } from "@/components/containers/BrandedContentView";
import { PasswordResetLinkSentScreenProps } from "@/features/auth/navigation/auth-routes";
import { H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";

export function PasswordResetLinkSentScreen({
  navigation,
  route,
}: PasswordResetLinkSentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { email } = route.params;
  return (
    <BrandedContentView
      footerComponent={
        <BottomActionContainer transparent>
          <Button
            type="secondary"
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
      <H3 style={{ marginTop: theme.spacing.xl, color: theme.colors.offWhite }}>
        {t("forgot_password.reset_link_sent", { email })}
      </H3>
      <H3 style={{ marginTop: theme.spacing.m, color: theme.colors.offWhite }}>
        {t("forgot_password.mail_being_deliverd")}
      </H3>
      <H3 style={{ marginTop: theme.spacing.m, color: theme.colors.offWhite }}>
        {t("common.if_problem_contact_support")}
      </H3>
    </BrandedContentView>
  );
}
