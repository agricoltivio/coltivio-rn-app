import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { SpeedDialSettingsBody } from "@/features/user/SpeedDialSettingsScreen";
import { H1, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { SpeedDialOnboardingScreenProps } from "./navigation/home-routes";

export function SpeedDialOnboardingScreen({
  navigation,
}: SpeedDialOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("speedDialOnboardingCompleted", true);
    navigation.goBack();
  }

  const steps = [
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("speed_dial.onboarding.welcome_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
        }}
      >
        {t("speed_dial.onboarding.welcome_body")}
      </H3>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: theme.spacing.l,
          gap: theme.spacing.s,
        }}
      >
        <H3 style={{ color: theme.colors.primary, flex: 1 }}>
          {t("speed_dial.onboarding.settings_hint")}
        </H3>
      </View>
      <View
        style={{
          alignSelf: "center",
          alignItems: "center",
          marginTop: theme.spacing.l,
          borderWidth: 1,
          borderColor: theme.colors.gray3,
          borderRadius: 100,
          padding: theme.spacing.s,
        }}
      >
        <Ionicons
          name="settings-outline"
          size={40}
          color={theme.colors.black}
        />
      </View>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("speed_dial.onboarding.configure_heading")}
      </H1>
      <SpeedDialSettingsBody />
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
