import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { IconBadge } from "../onboarding/IconBadge";
import { OnboardingScreen } from "../onboarding/OnboardingScreen";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useNavigation } from "@react-navigation/native";

export function MergePlotsOnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const navigation = useNavigation();

  function handleFinish() {
    updateLocalSettings("mergePlotsOnboardingCompleted", true);
    navigation.goBack();
  }

  const steps = [
    <View key="welcome" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.merge_onboarding.welcome_heading")}
      </H1>
      <IconBadge name="table-merge-cells" />
      <H3
        style={{
          color: theme.colors.primary,
          textAlign: "center",
        }}
      >
        {t("plots.merge_onboarding.welcome_body")}
      </H3>
    </View>,
    <View key="confirm" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.merge_onboarding.confirm_heading")}
      </H1>
      <IconBadge name="check" />
      <H3
        style={{
          color: theme.colors.primary,
          textAlign: "center",
        }}
      >
        {t("plots.merge_onboarding.confirm_body")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
