import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";

type ChipProps = {
  label: string;
  /** Highlighted state — primary background + white text */
  active?: boolean;
  /** Accent variant — primary border + primary text, white background */
  accent?: boolean;
  onPress?: () => void;
  /** Renders a × icon and calls this when tapped */
  onRemove?: () => void;
};

export function Chip({ label, active = false, accent = false, onPress, onRemove }: ChipProps) {
  const theme = useTheme();

  const bgColor = active ? theme.colors.primary : theme.colors.white;
  const borderColor = active || accent ? theme.colors.primary : theme.colors.gray3;
  const textColor = active ? theme.colors.white : accent ? theme.colors.primary : theme.colors.gray1;
  const iconColor = active ? theme.colors.white : accent ? theme.colors.primary : theme.colors.gray2;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !onRemove}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: theme.radii.xxl,
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: textColor,
        }}
      >
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons
            name="close"
            size={16}
            color={iconColor}
          />
        </Pressable>
      )}
    </Pressable>
  );
}
