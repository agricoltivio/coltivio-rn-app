import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { HerdsOnboardingScreenProps } from "./navigation/animals-routes";

export function HerdsOnboardingScreen({
  navigation,
}: HerdsOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("herdsOnboardingCompleted", true);
    navigation.replace("Herds");
  }

  const steps = [
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.herds_onboarding.step1_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("animals.herds_onboarding.step1_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.herds_onboarding.step2_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("animals.herds_onboarding.step2_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.herds_onboarding.step3_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("animals.herds_onboarding.step3_body")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
