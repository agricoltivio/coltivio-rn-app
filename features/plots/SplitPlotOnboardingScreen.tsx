import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { IconBadge } from "../onboarding/IconBadge";
import { OnboardingScreen } from "../onboarding/OnboardingScreen";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { SplitPlotOnboardingScreenProps } from "./navigation/plots-routes";

export function SplitPlotOnboardingScreen({
  navigation,
}: SplitPlotOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("splitPlotOnboardingCompleted", true);
    navigation.goBack();
  }

  const steps = [
    <View key="welcome" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.split_onboarding.welcome_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("plots.split_onboarding.welcome_body")}
      </H3>
    </View>,
    <View key="line" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.split_onboarding.line_heading")}
      </H1>
      <IconBadge name="vector-polyline-plus" />
      <H3
        style={{
          color: theme.colors.primary,
          textAlign: "center",
        }}
      >
        {t("plots.split_onboarding.line_body")}
      </H3>
    </View>,
    <View key="area" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.split_onboarding.area_heading")}
      </H1>
      <IconBadge name="vector-polygon" />
      <H3
        style={{
          color: theme.colors.primary,
          textAlign: "center",
        }}
      >
        {t("plots.split_onboarding.area_body")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
