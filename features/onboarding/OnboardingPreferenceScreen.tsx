import { ContentView } from "@/components/containers/ContentView";
import { OnboardingPreferenceScreenProps } from "@/features/onboarding/navigation/onboarding-routes";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { NavigationButton } from "./NavigationButton";
import { Stepper } from "./Stepper";
import { OnboardingPreferencePage } from "./pages/OnboardingPreferencePage";

export function OnboardingPreferenceScreen({
  navigation,
}: OnboardingPreferenceScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ContentView headerVisible={false}>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <OnboardingPreferencePage />
      </View>
      <View style={{ padding: theme.spacing.m }}>
        <Stepper totalSteps={4} currentStep={4} />
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
