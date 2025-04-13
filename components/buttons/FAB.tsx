import { ColtivioTheme } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type FABProps = {
  icon: {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
  };
  color?: keyof ColtivioTheme["colors"];
  onPress?: () => void;
};

export function FAB({ onPress, color: type = "primary", icon }: FABProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + theme.spacing.s,
        right: theme.spacing.xl,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: theme.colors[type],
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: "center",
          justifyContent: "center",
          shadowOffset: { width: 2, height: 5 },
          shadowOpacity: 0.6,
          shadowRadius: 5,
          elevation: 10,
        }}
      >
        <Ionicons name={icon.name} size={24} color={icon.color} />
      </TouchableOpacity>
    </View>
  );
}

const ButtonContainer = styled.TouchableOpacity<{
  type: "primary" | "secondary" | "accent";
}>`
  background-color: ${({ theme, type }) => theme.colors[type]};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
`;
