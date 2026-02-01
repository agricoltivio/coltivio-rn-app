import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
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
      <TouchableOpacity
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
      </TouchableOpacity>
      <TouchableOpacity
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
      </TouchableOpacity>
    </View>
  );
}
