import { Subtitle } from "@/theme/Typography";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

export type ChartMode = "cumulative" | "monthly";

// Same segmented-toggle style as the dashboard/list switch in HarvestsScreen's
// ViewToggle: bordered pill, active option filled with the primary color.
export function ChartViewSwitcher({
  value,
  onChange,
  options,
}: {
  value: ChartMode;
  onChange: (mode: ChartMode) => void;
  options: { key: ChartMode; label: string }[];
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.gray3,
        overflow: "hidden",
        alignSelf: "flex-start",
      }}
    >
      {options.map((option) => {
        const isActive = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: isActive
                ? theme.colors.primary
                : theme.colors.white,
            }}
          >
            <Subtitle
              style={{
                fontSize: 14,
                color: isActive ? "#fff" : theme.colors.gray2,
              }}
            >
              {option.label}
            </Subtitle>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
