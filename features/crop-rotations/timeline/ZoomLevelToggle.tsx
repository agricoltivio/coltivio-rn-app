import { Pressable, View, Text } from "react-native";
import { useTheme } from "styled-components/native";

export type ZoomLevel = "years" | "months" | "weeks";

type ZoomLevelToggleProps = {
  zoomLevel: ZoomLevel;
  onChangeZoomLevel: (level: ZoomLevel) => void;
};

const LEVELS: { key: ZoomLevel; label: string }[] = [
  { key: "years", label: "Years" },
  { key: "months", label: "Months" },
  { key: "weeks", label: "Weeks" },
];

export function ZoomLevelToggle({
  zoomLevel,
  onChangeZoomLevel,
}: ZoomLevelToggleProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.gray4,
        borderRadius: theme.radii.l,
        padding: 2,
        alignSelf: "flex-start",
      }}
    >
      {LEVELS.map(({ key, label }) => {
        const isActive = zoomLevel === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChangeZoomLevel(key)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: theme.radii.l - 2,
              backgroundColor: isActive ? theme.colors.primary : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isActive ? theme.colors.white : theme.colors.gray2,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Scale factors: px per day for each zoom level (computed from viewport width)
export function getScaleForZoomLevel(
  zoomLevel: ZoomLevel,
  viewportWidth: number,
): number {
  switch (zoomLevel) {
    case "years":
      return viewportWidth / (365 * 3); // ~3 years visible
    case "months":
      return viewportWidth / 120; // ~4 months visible
    case "weeks":
      return viewportWidth / 35; // ~5 weeks visible
  }
}
