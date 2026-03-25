import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { H1, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { WikiOnboardingScreenProps } from "./navigation/wiki-routes";

export function WikiOnboardingScreen({
  navigation,
}: WikiOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("wikiOnboardingCompleted", true);
    navigation.replace("WikiList");
  }

  const steps = [
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("wiki.onboarding.step1_heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("wiki.onboarding.step1_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("wiki.onboarding.step2_heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("wiki.onboarding.step2_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("wiki.onboarding.step3_heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("wiki.onboarding.step3_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("wiki.onboarding.step4_heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("wiki.onboarding.step4_body")}
      </H3>
      <View
        style={{
          alignSelf: "center",
          marginTop: theme.spacing.xl,
          width: 64,
          height: 64,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: theme.colors.gray3,
          backgroundColor: "rgba(52, 52, 52, 0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name="settings-outline"
          size={36}
          color={theme.colors.primary}
        />
      </View>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
