import { ContentView } from "@/components/containers/ContentView";
import { OnboardingPreferenceScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { Body, H2, H4 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { Stepper } from "./Stepper";

export function OnboardingPreferenceScreen({
  navigation,
}: OnboardingPreferenceScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const onboardingsDisabled = localSettings.onboardingsDisabled;

  return (
    <ContentView headerVisible={false}>
      <View
        style={{
          justifyContent: "center",
          flex: 1,
        }}
      >
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
          <Ionicons
            name="bulb-outline"
            size={24}
            color={theme.colors.primary}
          />
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

      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={5} currentStep={4} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title={t("buttons.back")}
            icon="arrow-back-circle-outline"
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("FarmSummary")}
          />
        </View>
      </View>
    </ContentView>
  );
}
