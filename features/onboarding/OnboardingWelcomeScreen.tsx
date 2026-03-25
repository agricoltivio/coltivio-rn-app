import { ContentView } from "@/components/containers/ContentView";
import { Button } from "@/components/buttons/Button";
import { H1, H3 } from "@/theme/Typography";
import { OnboardingWelcomeScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export function OnboardingWelcomeScreen({
  navigation,
}: OnboardingWelcomeScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ContentView headerVisible={false}>
      <View
        style={{ justifyContent: "center", flex: 1, padding: theme.spacing.m }}
      >
        <H1 style={{ color: theme.colors.primary }}>
          {t("onboarding.welcome.heading")}
        </H1>
        <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
          {t("onboarding.welcome.subheading")}
        </H3>
        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.m }}>
          <Button
            type="primary"
            title={t("onboarding.welcome.create_farm")}
            onPress={() => navigation.navigate("SelectFarmName")}
          />
          <Button
            type="accent"
            title={t("onboarding.welcome.join_farm")}
            onPress={() => navigation.navigate("JoinFarm")}
          />
        </View>
      </View>
    </ContentView>
  );
}
