import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";

export type ViewMode = "list" | "timeline";

type ViewModeToggleProps = {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
};

export function ViewModeToggle({
  viewMode,
  onChangeViewMode,
}: ViewModeToggleProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.gray4,
        borderRadius: theme.radii.l,
        padding: 2,
      }}
    >
      <Pressable
        onPress={() => onChangeViewMode("timeline")}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: theme.radii.l - 2,
          backgroundColor:
            viewMode === "timeline" ? theme.colors.primary : "transparent",
        }}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={
            viewMode === "timeline" ? theme.colors.white : theme.colors.gray2
          }
        />
      </Pressable>
      <Pressable
        onPress={() => onChangeViewMode("list")}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: theme.radii.l - 2,
          backgroundColor:
            viewMode === "list" ? theme.colors.primary : "transparent",
        }}
      >
        <Ionicons
          name="list-outline"
          size={18}
          color={viewMode === "list" ? theme.colors.white : theme.colors.gray2}
        />
      </Pressable>
    </View>
  );
}
