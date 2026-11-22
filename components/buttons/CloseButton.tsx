import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "styled-components/native";

type CloseButtonProps = {
  onPress: () => void;
  // White on dark backgrounds, e.g. the fullscreen image viewer
  color?: string;
  style?: StyleProp<ViewStyle>;
};

// Close button for modal and sheet headers: a plain icon without border or
// background, the same everywhere. Map controls keep their own buttons, they need a
// background to stay visible on the map.
export function CloseButton({ onPress, color, style }: CloseButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      // The icon is small, the touch area shouldn't be
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={t("buttons.close")}
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, style]}
    >
      <Ionicons name="close" size={28} color={color ?? theme.colors.primary} />
    </Pressable>
  );
}
