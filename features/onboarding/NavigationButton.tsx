import { H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";

export function NavigationButton({
  onPress,
  icon,
  title,
  disabled,
}: {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: "center",
      }}
    >
      <Ionicons
        name={icon}
        size={40}
        color={disabled ? theme.colors.gray3 : theme.colors.primary}
      />
      <H3
        style={{ color: disabled ? theme.colors.gray3 : theme.colors.primary }}
      >
        {title}
      </H3>
    </TouchableOpacity>
  );
}
