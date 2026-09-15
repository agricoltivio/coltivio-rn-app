import { Text } from "@/components/text/Text";
import { dataSourcesUrl } from "@/utils/links";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";

type MapAttributionProps = {
  bottomOffset?: number;
  alignRight?: boolean;
};

/**
 * Source note for swisstopo and the cantonal geodata. The terms of use require it to be
 * visible on the map; the full per-canton attribution lives on the landing page.
 */
export function MapAttribution({
  bottomOffset,
  alignRight,
}: MapAttributionProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  return (
    <TouchableOpacity
      accessibilityRole="link"
      activeOpacity={0.8}
      onPress={() => Linking.openURL(dataSourcesUrl(i18n.language))}
      style={[
        styles.pill,
        alignRight ? { right: theme.spacing.s } : { left: theme.spacing.xs },
        { bottom: bottomOffset ?? theme.spacing.xs },
      ]}
    >
      <Text style={styles.text}>{t("settings.map.attribution")}</Text>
      <Ionicons
        name="information-circle-outline"
        size={11}
        color="#fff"
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  text: {
    fontSize: 9,
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  icon: {
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
});
