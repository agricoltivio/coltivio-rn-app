import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H1, H3 } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NavigationButton } from "../onboarding/NavigationButton";
import { Stepper } from "../onboarding/Stepper";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useNavigation } from "@react-navigation/native";

const TOTAL_STEPS = 4;

function IconBadge({ name }: { name: keyof typeof MaterialCommunityIcons.glyphMap }) {
  return (
    <View
      style={{
        alignSelf: "center",
        marginVertical: 24,
        width: 64,
        height: 64,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#ddd",
        backgroundColor: "rgba(52, 52, 52, 0.08)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons name={name} size={36} color="black" />
    </View>
  );
}

export function MapDrawOnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const navigation = useNavigation();
  const [step, setStep] = useState(1);

  // Mark completed on any dismissal (swipe down, back gesture, finish button)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      updateLocalSettings("mapDrawOnboardingCompleted", true);
    });
    return unsubscribe;
  }, [navigation]);

  function handleFinish() {
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
          <Stepper totalSteps={TOTAL_STEPS} currentStep={step} />
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
            {step < TOTAL_STEPS ? (
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
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
          flexGrow: 1,
          paddingHorizontal: theme.spacing.l,
        }}
      >
        {step === 1 && (
          <View style={{ alignItems: "center" }}>
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
              {t("map_draw_onboarding.welcome_body")}
            </H3>
          </View>
        )}

        {step === 2 && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.select_heading")}
            </H1>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.s,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.select_body")}
            </H3>
          </View>
        )}

        {step === 3 && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.draw_heading")}
            </H1>
            <IconBadge name="vector-polyline-plus" />
            <H3
              style={{
                color: theme.colors.primary,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.draw_body")}
            </H3>
          </View>
        )}

        {step === 4 && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.finish_heading")}
            </H1>
            <IconBadge name="check" />
            <H3
              style={{
                color: theme.colors.primary,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.finish_body")}
            </H3>
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
