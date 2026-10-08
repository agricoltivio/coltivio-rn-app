import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { Text } from "@/components/text/Text";
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
  /** Override background color */
  bgColor?: string;
  /** Override text color */
  textColor?: string;
  /** Outline variant — white background, border and text in this color */
  outlineColor?: string;
  /** Reduced padding and font size */
  small?: boolean;
  /** Fixed width with centered text, so chips with different labels line up */
  width?: number;
};

export function Chip({
  label,
  active = false,
  accent = false,
  onPress,
  onRemove,
  bgColor: bgColorProp,
  textColor: textColorProp,
  outlineColor,
  small = false,
  width,
}: ChipProps) {
  const theme = useTheme();

  const bgColor = outlineColor
    ? theme.colors.white
    : (bgColorProp ?? (active ? theme.colors.primary : theme.colors.white));
  const borderColor =
    outlineColor ??
    bgColorProp ??
    (active || accent ? theme.colors.primary : theme.colors.gray3);
  const textColor =
    outlineColor ??
    textColorProp ??
    (active
      ? theme.colors.white
      : accent
        ? theme.colors.primary
        : theme.colors.gray1);
  const iconColor =
    outlineColor ??
    textColorProp ??
    (active
      ? theme.colors.white
      : accent
        ? theme.colors.primary
        : theme.colors.gray2);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !onRemove}
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        paddingVertical: small ? 3 : 8,
        // The fixed width already provides the horizontal space
        paddingHorizontal: width != null ? 0 : small ? 8 : 14,
        width,
        justifyContent: "center",
        borderRadius: theme.radii.xxl,
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor,
      }}
    >
      <Text
        style={{
          fontSize: small ? 11 : 13,
          fontWeight: "500",
          color: textColor,
        }}
      >
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close" size={16} color={iconColor} />
        </Pressable>
      )}
    </Pressable>
  );
}
