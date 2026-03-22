import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { Body, H2, H4 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

export function OnboardingPreferencePage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const onboardingsDisabled = localSettings.onboardingsDisabled;

  return (
    <View style={{ width: "100%" }}>
      <H2 style={{ color: theme.colors.primary }}>
        {t("onboarding.preference.heading")}
      </H2>

      {/* Guided option (onboardings enabled = default) */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: theme.spacing.m,
          marginTop: theme.spacing.l,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: !onboardingsDisabled
            ? theme.colors.primary
            : theme.colors.gray4,
          backgroundColor: !onboardingsDisabled
            ? theme.colors.accent
            : "transparent",
        }}
        onPress={() => updateLocalSettings("onboardingsDisabled", false)}
      >
        <Ionicons name="bulb-outline" size={24} color={theme.colors.primary} />
        <View style={{ marginLeft: theme.spacing.m, flex: 1 }}>
          <H4>{t("onboarding.preference.guided")}</H4>
          <Body style={{ fontSize: 14, color: theme.colors.gray1 }}>
            {t("onboarding.preference.guided_desc")}
          </Body>
        </View>
      </TouchableOpacity>

      {/* Explore option (onboardings disabled) */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: theme.spacing.m,
          marginTop: theme.spacing.s,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: onboardingsDisabled
            ? theme.colors.primary
            : theme.colors.gray4,
          backgroundColor: onboardingsDisabled
            ? theme.colors.accent
            : "transparent",
        }}
        onPress={() => updateLocalSettings("onboardingsDisabled", true)}
      >
        <Ionicons
          name="rocket-outline"
          size={24}
          color={theme.colors.primary}
        />
        <View style={{ marginLeft: theme.spacing.m, flex: 1 }}>
          <H4>{t("onboarding.preference.explore")}</H4>
          <Body style={{ fontSize: 14, color: theme.colors.gray1 }}>
            {t("onboarding.preference.explore_desc")}
          </Body>
        </View>
      </TouchableOpacity>

      <Body
        style={{
          fontSize: 13,
          color: theme.colors.gray2,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("onboarding.preference.change_hint")}
      </Body>
    </View>
  );
}
