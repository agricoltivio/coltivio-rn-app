import { H1, H3, Body } from "@/theme/Typography";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { IconBadge } from "../onboarding/IconBadge";
import { OnboardingScreen } from "../onboarding/OnboardingScreen";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useNavigation } from "@react-navigation/native";

function ActionRow({
  icon,
  label,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: "#ddd",
          backgroundColor: "rgba(52, 52, 52, 0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name={icon} size={22} color={color ?? "black"} />
      </View>
      <Body style={{ flex: 1 }}>{label}</Body>
    </View>
  );
}

export function AdjustPlotOnboardingScreen() {
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
        {t("plots.adjust_onboarding.welcome_heading")}
      </H1>
      <IconBadge name="square-edit-outline" />
      <H3 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.adjust_onboarding.welcome_body")}
      </H3>
    </View>,
    <View key="actions" style={{ alignItems: "center", width: "100%" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.adjust_onboarding.actions_heading")}
      </H1>
      <View style={{ width: "100%", marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
        <ActionRow
          icon="check-circle-outline"
          color="green"
          label={t("plots.adjust_onboarding.confirm_body")}
        />
        <ActionRow
          icon="close-circle-outline"
          label={t("plots.adjust_onboarding.abort_body")}
        />
      </View>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.m,
          textAlign: "center",
        }}
      >
        {t("plots.adjust_onboarding.overlap_body")}
      </H3>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
