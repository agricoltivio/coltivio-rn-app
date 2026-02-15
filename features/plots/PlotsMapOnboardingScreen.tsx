import { H1, H3, Body } from "@/theme/Typography";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { IconBadge } from "../onboarding/IconBadge";
import { OnboardingScreen } from "../onboarding/OnboardingScreen";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useNavigation } from "@react-navigation/native";

function ToolRow({
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

export function PlotsMapOnboardingScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { updateLocalSettings } = useLocalSettings();
  const navigation = useNavigation();

  function handleFinish() {
    updateLocalSettings("plotsMapOnboardingCompleted", true);
    navigation.goBack();
  }

  const steps = [
    // Screen 1: Browse plots
    <View key="browse" style={{ alignItems: "center" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.map_onboarding.browse_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("plots.map_onboarding.browse_body")}
      </H3>
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
        <Ionicons name="list" size={36} color="black" />
      </View>
      <H3
        style={{
          color: theme.colors.primary,
          textAlign: "center",
        }}
      >
        {t("plots.map_onboarding.browse_expand_info")}
      </H3>
    </View>,

    // Screen 2: Toolbox
    <View key="tools" style={{ alignItems: "center", width: "100%" }}>
      <H1 style={{ color: theme.colors.primary, textAlign: "center" }}>
        {t("plots.map_onboarding.tools_heading")}
      </H1>
      <H3
        style={{
          color: theme.colors.primary,
          marginTop: theme.spacing.s,
          textAlign: "center",
        }}
      >
        {t("plots.map_onboarding.tools_body")}
      </H3>
      <IconBadge name="tools" />
      <View
        style={{
          width: "100%",
          marginTop: theme.spacing.s,
          gap: theme.spacing.xs,
        }}
      >
        <ToolRow
          icon="pencil-plus-outline"
          label={t("plots.map_onboarding.tool_add")}
        />
        <ToolRow
          icon="scissors-cutting"
          label={t("plots.map_onboarding.tool_split")}
        />
        <ToolRow
          icon="table-merge-cells"
          label={t("plots.map_onboarding.tool_merge")}
        />
        <ToolRow
          icon="vector-square-edit"
          label={t("plots.map_onboarding.tool_edit")}
        />
        <ToolRow
          icon="delete-outline"
          label={t("plots.map_onboarding.tool_delete")}
          color="red"
        />
      </View>
    </View>,
  ];

  return <OnboardingScreen steps={steps} onFinish={handleFinish} />;
}
