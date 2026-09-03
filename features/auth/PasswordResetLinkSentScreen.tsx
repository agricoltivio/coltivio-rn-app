import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { PasswordResetLinkSentScreenProps } from "@/features/auth/navigation/auth-routes";
import { BrandBackground } from "@/features/splash/BrandBackground";
import { AUTH_HEADER_OFFSET } from "@/features/splash/brand";
import { H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

export function PasswordResetLinkSentScreen({
  navigation,
  route,
}: PasswordResetLinkSentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { email } = route.params;
  return (
    <BrandBackground>
      <ContentView
        style={{ paddingTop: insets.top + AUTH_HEADER_OFFSET }}
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
      </ContentView>
    </BrandBackground>
  );
}
