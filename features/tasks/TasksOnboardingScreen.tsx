import { OnboardingScreen } from "@/features/onboarding/OnboardingScreen";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { H1, H3, Subtitle } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { TasksOnboardingScreenProps } from "./navigation/tasks-routes";

export function TasksOnboardingScreen({
  navigation,
}: TasksOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();

  function handleFinish() {
    updateLocalSettings("tasksOnboardingCompleted", true);
    navigation.replace("TaskList");
  }

  const steps = [
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("tasks.onboarding.step1_heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("tasks.onboarding.step1_body")}
      </H3>
    </View>,
    <View>
      <H1 style={{ color: theme.colors.primary }}>
        {t("tasks.onboarding.step2_heading")}
      </H1>
      <H3 style={{ color: theme.colors.primary, marginTop: theme.spacing.s }}>
        {t("tasks.onboarding.step2_body")}
      </H3>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
          gap: theme.spacing.m,
          marginTop: theme.spacing.xxl,
        }}
      >
        <View
          style={{
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
            name="checkbox-outline"
            size={36}
            color={theme.colors.primary}
          />
        </View>
        <Subtitle style={{ color: theme.colors.gray1, flexShrink: 1 }}>
          {t("tasks.onboarding.step2_icon_hint")}
        </Subtitle>
      </View>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
