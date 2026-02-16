import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { NavigationButton } from "@/features/onboarding/NavigationButton";
import { Stepper } from "@/features/onboarding/Stepper";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { SpeedDialSettingsBody } from "@/features/user/SpeedDialSettingsScreen";
import { H1, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
  const [step, setStep] = useState(1);

  function handleFinish() {
    updateLocalSettings("speedDialOnboardingCompleted", true);
    navigation.goBack();
  }

  return (
    <ContentView
      headerVisible={false}
      footerComponent={
        <View
          style={{
            padding: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.gray4,
          }}
        >
          <Stepper totalSteps={2} currentStep={step} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: step > 1 ? "space-between" : "flex-end",
              marginHorizontal: theme.spacing.m,
            }}
          >
            {step > 1 && (
              <NavigationButton
                title={t("buttons.back")}
                icon="arrow-back-circle-outline"
                onPress={() => setStep((s) => s - 1)}
              />
            )}
            {step < 2 ? (
              <NavigationButton
                title={t("buttons.next")}
                icon="arrow-forward-circle-outline"
                onPress={() => setStep((s) => s + 1)}
              />
            ) : (
              <NavigationButton
                title={t("buttons.finish")}
                icon="checkmark-circle-outline"
                onPress={handleFinish}
              />
            )}
          </View>
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      >
        <View>
          {step === 1 && (
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
            </View>
          )}

          {step === 2 && (
            <View>
              <H1 style={{ color: theme.colors.primary }}>
                {t("speed_dial.onboarding.configure_heading")}
              </H1>
              <SpeedDialSettingsBody />
            </View>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
