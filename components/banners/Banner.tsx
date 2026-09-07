import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "styled-components/native";
import { H2 } from "@/theme/Typography";

type BannerProps = {
  title: string;
  variant?: "warning" | "danger";
  onPress?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
};

/**
 * Full-width notice strip, modelled on the membership banners on the home screen.
 * Dismissible only when onDismiss is passed.
 */
export function Banner({
  title,
  variant = "warning",
  onPress,
  onDismiss,
  style,
}: BannerProps) {
  const theme = useTheme();
  const isDanger = variant === "danger";
  const textColor = isDanger ? theme.colors.white : theme.colors.black;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isDanger ? theme.colors.danger : theme.colors.warning,
        borderRadius: theme.radii.m,
        padding: theme.spacing.m,
        marginTop: theme.spacing.m,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
    >
      <H2 style={{ color: textColor, fontSize: 15, flex: 1 }}>{title}</H2>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={8}>
          <Ionicons name="close" size={20} color={textColor} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}
