import { Text } from "@/components/text/Text";
import { dataSourcesUrl } from "@/utils/links";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";

type MapAttributionProps = {
  bottomOffset?: number;
};

/**
 * Source note for swisstopo and the cantonal geodata. The terms of use require it to be
 * visible on the map; the full per-canton attribution lives on the landing page.
 */
export function MapAttribution({ bottomOffset }: MapAttributionProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="link"
      activeOpacity={0.8}
      onPress={() => Linking.openURL(dataSourcesUrl(i18n.language))}
      style={[
        styles.pill,
        {
          left: theme.spacing.xs,
          bottom: bottomOffset ?? theme.spacing.xs,
        },
      ]}
    >
      <Text style={styles.text}>{t("settings.map.attribution")}</Text>
      <Ionicons name="information-circle-outline" size={12} color="#333" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  text: {
    fontSize: 10,
    color: "#333",
  },
});
