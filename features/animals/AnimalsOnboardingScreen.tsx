import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { AnimalsSettingsBody } from "./AnimalsSettingsScreen";
import { AnimalsOnboardingScreenProps } from "./navigation/animals-routes";

export function AnimalsOnboardingScreen({
  navigation,
}: AnimalsOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("animalsOnboardingCompleted", true);
    navigation.replace("AnimalsHub");
  }

  const steps = [
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.onboarding.welcome_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("animals.onboarding.welcome_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.onboarding.configure_heading")}
      </H1>
      <AnimalsSettingsBody />
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("animals.onboarding.done_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("animals.onboarding.done_body")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
