import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "styled-components/native";
import { hexToRgba } from "@/theme/theme";
import { H2 } from "@/theme/Typography";

type BannerProps = {
  title: string;
  variant?: "brand" | "warning" | "danger";
  // Appended inline after the title, same size, underlined — a visible hint that
  // the strip is pressable.
  actionLabel?: string;
  loading?: boolean;
  onPress?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
};

/**
 * Full-width notice strip, modelled on the membership banners on the home screen.
 * Dismissible only when onDismiss is passed.
 *
 * brand/warning render as a tinted outline (accent border + text, translucent
 * fill); danger is a solid critical fill with white text.
 */
export function Banner({
  title,
  variant = "brand",
  actionLabel,
  loading = false,
  onPress,
  onDismiss,
  style,
}: BannerProps) {
  const theme = useTheme();
  const isDanger = variant === "danger";
  const accentColor =
    variant === "warning" ? theme.colors.amber : theme.colors.primary;
  const textColor = isDanger ? theme.colors.white : accentColor;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isDanger
          ? theme.colors.danger
          : hexToRgba(accentColor, 0.12),
        borderWidth: isDanger ? 0 : 1,
        borderColor: accentColor,
        borderRadius: theme.radii.m,
        padding: theme.spacing.m,
        marginTop: theme.spacing.m,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing.s,
        ...style,
      }}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress || loading}
    >
      <H2 style={{ color: textColor, fontSize: 15, flex: 1 }}>
        {title}
        {actionLabel ? (
          <H2
            style={{
              color: textColor,
              fontSize: 15,
              textDecorationLine: "underline",
            }}
          >
            {" "}
            {actionLabel}
          </H2>
        ) : null}
      </H2>
      {loading ? <ActivityIndicator size="small" color={textColor} /> : null}
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={20} color={textColor} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}
