import { H1, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { IconBadge } from "../onboarding/IconBadge";
import { OnboardingScreen } from "../onboarding/OnboardingScreen";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { PlotsStackParamList } from "./navigation/plots-routes";
import { ReactNode } from "react";

export function AddPlotOnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<PlotsStackParamList, "AddPlotOnboarding">>();
  const variant = route.params.variant;

  function handleFinish() {
    const key =
      variant === "draw"
        ? "addPlotDrawOnboardingCompleted"
        : "addPlotParcelOnboardingCompleted";
    updateLocalSettings(key, true);
    navigation.goBack();
  }

  const welcomeStep = (
    <View key="welcome" style={{ alignItems: "center" }}>
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
        {t(
          variant === "draw"
            ? "map_draw_onboarding.welcome_body_draw"
            : "map_draw_onboarding.welcome_body_parcel",
        )}
      </H3>
    </View>
  );

  const overlapStep = (
    <View key="overlap" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("map_draw_onboarding.overlap_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("map_draw_onboarding.overlap_body")}
      </H3>
    </View>
  );

  let steps: ReactNode[];

  if (variant === "draw") {
    steps = [
      welcomeStep,
      <View key="draw" style={{ alignItems: "center" }}>
        <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
          {t("map_draw_onboarding.draw_heading")}
        </H1>
        <IconBadge name="vector-polygon" />
        <H3
          style={{ color: theme.colors.primary, textAlign: "center" }}
        >
          {t("map_draw_onboarding.draw_body")}
        </H3>
      </View>,
      <View key="finish" style={{ alignItems: "center" }}>
        <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
          {t("map_draw_onboarding.finish_heading")}
        </H1>
        <IconBadge name="check" />
        <H3
          style={{ color: theme.colors.primary, textAlign: "center" }}
        >
          {t("map_draw_onboarding.finish_body")}
        </H3>
      </View>,
      overlapStep,
    ];
  } else {
    steps = [
      welcomeStep,
      <View key="parcel" style={{ alignItems: "center" }}>
        <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
          {t("map_draw_onboarding.parcel_heading")}
        </H1>
        <H3
          style={{
            color: theme.colors.primary,
            marginTop: theme.spacing.s,
            textAlign: "center",
          }}
        >
          {t("map_draw_onboarding.parcel_body")}
        </H3>
      </View>,
      overlapStep,
    ];
  }

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
