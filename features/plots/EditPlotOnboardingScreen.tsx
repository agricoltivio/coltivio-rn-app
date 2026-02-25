import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { IconBadge } from "../onboarding/IconBadge";
import { OnboardingScreen } from "../onboarding/OnboardingScreen";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useNavigation } from "@react-navigation/native";

export function EditPlotOnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const navigation = useNavigation();

  function handleFinish() {
    updateLocalSettings("editPlotOnboardingCompleted", true);
    navigation.goBack();
  }

  const steps = [
    <View key="welcome" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("map_draw_onboarding.welcome_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("map_draw_onboarding.welcome_body_edit")}
      </H3>
    </View>,
    <View key="editIntro" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("map_draw_onboarding.edit_intro_heading")}
      </H1>
      <IconBadge name="vector-square-edit" />
      <H3
        style={{ color: theme.colors.primary, textAlign: "center" }}
      >
        {t("map_draw_onboarding.edit_intro_body")}
      </H3>
    </View>,
    <View key="finish" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("map_draw_onboarding.finish_heading")}
      </H1>
      <IconBadge name="check" />
      <H3
        style={{ color: theme.colors.primary, textAlign: "center" }}
      >
        {t("map_draw_onboarding.finish_body")}
      </H3>
    </View>,
    <View key="overlap" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("map_draw_onboarding.overlap_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("map_draw_onboarding.overlap_body")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
