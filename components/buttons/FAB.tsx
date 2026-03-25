import { ColtivioTheme } from "@/theme/theme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

type FABProps = {
  icon: {
    name: keyof typeof Ionicons.glyphMap;
    color: string;
  };
  color?: keyof ColtivioTheme["colors"];
  onPress?: () => void;
};

export function FAB({ onPress, color: type = "mocha", icon }: FABProps) {
  const theme = useTheme();
  return (
    <View
      style={{
        position: "absolute",
        bottom: theme.spacing.m,
        right: theme.spacing.m,
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
          shadowColor: theme.colors[type],
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.7,
          shadowRadius: 5,
          elevation: 10,
        }}
      >
        <Ionicons name={icon.name} size={24} color={icon.color} />
      </TouchableOpacity>
    </View>
  );
}
