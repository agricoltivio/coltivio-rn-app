import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "./LocalSettingsContext";
import { MapSettingsScreenProps } from "./navigation/user-routes";

const MAP_LAYER_OPTIONS: Array<{
  value: "satellite" | "map";
  labelKey: string;
}> = [
  { value: "satellite", labelKey: "settings.map.layer_satellite" },
  { value: "map", labelKey: "settings.map.layer_map" },
];

const COLOR_MODE_OPTIONS: Array<{
  value: "plot" | "crop" | "usage" | "cutting";
  labelKey: string;
}> = [
  { value: "plot", labelKey: "plots.color_mode.plot" },
  { value: "crop", labelKey: "plots.color_mode.crop" },
  { value: "usage", labelKey: "plots.color_mode.usage" },
  { value: "cutting", labelKey: "plots.color_mode.cutting" },
];

export function MapSettingsScreen(_props: MapSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  return (
    <ScrollView
      headerTitleOnScroll={t("settings.map.title")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("settings.map.title")}</H2>

        <H2
          style={{
            fontSize: 14,
            color: theme.colors.gray2,
            marginTop: theme.spacing.l,
            marginBottom: theme.spacing.xs,
          }}
        >
          {t("settings.map.layer_heading")}
        </H2>
        <View
          style={{
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          {MAP_LAYER_OPTIONS.map((option, index) => {
            const isActive = localSettings.defaultMapLayer === option.value;
            return (
              <ListItem
                key={option.value}
                style={{ backgroundColor: theme.colors.white }}
                hideBottomDivider={index === MAP_LAYER_OPTIONS.length - 1}
                onPress={() =>
                  updateLocalSettings("defaultMapLayer", option.value)
                }
              >
                <ListItem.Content>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {t(option.labelKey)}
                  </ListItem.Title>
                </ListItem.Content>
                {isActive && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                    style={{ marginRight: theme.spacing.m }}
                  />
                )}
              </ListItem>
            );
          })}
        </View>

        <H2
          style={{
            fontSize: 14,
            color: theme.colors.gray2,
            marginTop: theme.spacing.l,
            marginBottom: theme.spacing.xs,
          }}
        >
          {t("settings.map.color_mode_heading")}
        </H2>
        <View
          style={{
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          {COLOR_MODE_OPTIONS.map((option, index) => {
            const isActive = localSettings.defaultPlotColorMode === option.value;
            return (
              <ListItem
                key={option.value}
                style={{ backgroundColor: theme.colors.white }}
                hideBottomDivider={index === COLOR_MODE_OPTIONS.length - 1}
                onPress={() =>
                  updateLocalSettings("defaultPlotColorMode", option.value)
                }
              >
                <ListItem.Content>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {t(option.labelKey)}
                  </ListItem.Title>
                </ListItem.Content>
                {isActive && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                    style={{ marginRight: theme.spacing.m }}
                  />
                )}
              </ListItem>
            );
          })}
        </View>
      </ContentView>
    </ScrollView>
  );
}
