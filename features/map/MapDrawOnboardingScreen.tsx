import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H1, H3, Body } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { NavigationButton } from "../onboarding/NavigationButton";
import { Stepper } from "../onboarding/Stepper";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "@/navigation/rootStackTypes";

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
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={color ?? "black"}
        />
      </View>
      <Body style={{ flex: 1 }}>{label}</Body>
    </View>
  );
}

function IconBadge({
  name,
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
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

type Step =
  | "welcome"
  | "select"
  | "draw"
  | "finish"
  | "cancel"
  | "finishCancel"
  | "overlap"
  | "parcel"
  | "editIntro"
  | "cropRotationWelcome"
  | "plotsMapWelcome";

function getSteps(
  variant?: "draw" | "create" | "parcel" | "edit" | "cropRotation" | "plotsMap",
): Step[] {
  switch (variant) {
    case "draw":
      return ["welcome", "draw", "finish", "cancel", "overlap"];
    // "create" skips the "draw" step (already in drawing mode) and combines finish+cancel
    case "create":
      return ["welcome", "finishCancel", "overlap"];
    case "parcel":
      return ["welcome", "parcel", "overlap"];
    case "edit":
      return ["welcome", "editIntro", "finish", "cancel", "overlap"];
    case "cropRotation":
      return ["cropRotationWelcome"];
    case "plotsMap":
      return ["plotsMapWelcome"];
    default:
      return ["welcome", "select", "draw", "finish", "cancel"];
  }
}

export function MapDrawOnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, "MapDrawOnboarding">>();
  const variant = route.params?.variant as
    | "draw"
    | "create"
    | "parcel"
    | "edit"
    | "cropRotation"
    | "plotsMap"
    | undefined;

  const steps = getSteps(variant);

  const totalSteps = steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex];

  // Each variant has its own onboarding key
  const onboardingKey =
    variant === "draw" || variant === "create"
      ? "addPlotDrawOnboardingCompleted"
      : variant === "parcel"
        ? "addPlotParcelOnboardingCompleted"
        : variant === "edit"
          ? "editPlotOnboardingCompleted"
          : variant === "cropRotation"
            ? "selectPlotsForPlanOnboardingCompleted"
            : variant === "plotsMap"
              ? "plotsMapOnboardingCompleted"
              : "mapDrawOnboardingCompleted";

  // Mark completed on any dismissal (swipe down, back gesture, finish button)
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      updateLocalSettings(onboardingKey, true);
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
          <Stepper totalSteps={totalSteps} currentStep={stepIndex + 1} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: stepIndex > 0 ? "space-between" : "flex-end",
              marginHorizontal: theme.spacing.m,
            }}
          >
            {stepIndex > 0 && (
              <NavigationButton
                title={t("buttons.back")}
                icon="arrow-back-circle-outline"
                onPress={() => setStepIndex((s) => s - 1)}
              />
            )}
            {stepIndex < totalSteps - 1 ? (
              <NavigationButton
                title={t("buttons.next")}
                icon="arrow-forward-circle-outline"
                onPress={() => setStepIndex((s) => s + 1)}
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
        {currentStep === "welcome" && (
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
              {t(
                variant === "draw"
                  ? "map_draw_onboarding.welcome_body_draw"
                  : variant === "create"
                    ? "map_draw_onboarding.welcome_body_create"
                    : variant === "parcel"
                      ? "map_draw_onboarding.welcome_body_parcel"
                      : variant === "edit"
                        ? "map_draw_onboarding.welcome_body_edit"
                        : "map_draw_onboarding.welcome_body",
              )}
            </H3>
          </View>
        )}

        {currentStep === "select" && (
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

        {currentStep === "parcel" && (
          <View style={{ alignItems: "center" }}>
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
          </View>
        )}

        {currentStep === "editIntro" && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.edit_intro_heading")}
            </H1>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.s,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.edit_intro_body")}
            </H3>
          </View>
        )}

        {currentStep === "draw" && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.draw_heading")}
            </H1>
            <IconBadge name="vector-polygon" />
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

        {currentStep === "finish" && (
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

        {currentStep === "cancel" && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.cancel_heading")}
            </H1>
            <IconBadge name="close-circle-outline" />
            <H3
              style={{
                color: theme.colors.primary,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.cancel_body")}
            </H3>
          </View>
        )}

        {currentStep === "finishCancel" && (
          <View style={{ alignItems: "center", width: "100%" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.actions_heading")}
            </H1>
            <View
              style={{
                width: "100%",
                marginTop: theme.spacing.m,
                gap: theme.spacing.xs,
              }}
            >
              <ActionRow
                icon="check-circle-outline"
                color="green"
                label={t("map_draw_onboarding.finish_body")}
              />
              <ActionRow
                icon="close-circle-outline"
                label={t("map_draw_onboarding.cancel_body")}
              />
            </View>
          </View>
        )}

        {currentStep === "cropRotationWelcome" && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.crop_rotation_welcome_heading")}
            </H1>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.s,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.crop_rotation_welcome_body")}
            </H3>
          </View>
        )}

        {currentStep === "plotsMapWelcome" && (
          <View style={{ alignItems: "center" }}>
            <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
              {t("map_draw_onboarding.plots_map_welcome_heading")}
            </H1>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.s,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.plots_map_tap_body")}
            </H3>

            {/* FAB preview */}
            <View
              style={{
                marginTop: theme.spacing.xl,
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: theme.colors.blue,
                alignItems: "center",
                justifyContent: "center",
                elevation: 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <MaterialCommunityIcons name="plus" size={28} color="white" />
            </View>
            <H3
              style={{
                color: theme.colors.primary,
                marginTop: theme.spacing.m,
                textAlign: "center",
              }}
            >
              {t("map_draw_onboarding.plots_map_add_body")}
            </H3>
          </View>
        )}

        {currentStep === "overlap" && (
          <View style={{ alignItems: "center" }}>
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
        )}
      </ScrollView>
    </ContentView>
  );
}
