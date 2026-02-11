import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H1, H3 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "../onboarding/NavigationButton";
import { Stepper } from "../onboarding/Stepper";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { AnimalsSettingsBody } from "./AnimalsSettingsScreen";
import { AnimalsOnboardingScreenProps } from "./navigation/animals-routes";

export function AnimalsOnboardingScreen({
  navigation,
}: AnimalsOnboardingScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const [step, setStep] = useState(1);

  function handleFinish() {
    updateLocalSettings("animalsOnboardingCompleted", true);
    navigation.replace("AnimalsHub");
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
          <Stepper totalSteps={3} currentStep={step} />
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
            {step < 3 ? (
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
                {t("animals.onboarding.welcome_heading")}
              </H1>
              <H3
                style={{
                  color: theme.colors.primary,
                  marginTop: theme.spacing.s,
                }}
              >
                {t("animals.onboarding.welcome_body")}
              </H3>
            </View>
          )}

          {step === 2 && (
            <View>
              <H1 style={{ color: theme.colors.primary }}>
                {t("animals.onboarding.configure_heading")}
              </H1>
              <AnimalsSettingsBody />
            </View>
          )}

          {step === 3 && (
            <View>
              <H1 style={{ color: theme.colors.primary }}>
                {t("animals.onboarding.done_heading")}
              </H1>
              <H3
                style={{
                  color: theme.colors.primary,
                  marginTop: theme.spacing.s,
                }}
              >
                {t("animals.onboarding.done_body")}
              </H3>
            </View>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
