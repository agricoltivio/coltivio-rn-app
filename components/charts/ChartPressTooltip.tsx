import { View } from "react-native";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";
import { getYearColor } from "./chartColors";
import { formatYValue } from "./unitScaling";

// Tooltip content for the touched month: the value per selected year. Positioned
// and shown by MonthCartesianChart while the chart is touched.
export function ChartPressTooltip({
  activeMonth,
  monthLabels,
  selectedYears,
  availableYears,
  valuesByYear,
  unitLabel,
}: {
  activeMonth: number;
  monthLabels: string[];
  selectedYears: number[];
  availableYears: number[];
  valuesByYear: Record<number, number[]>;
  unitLabel: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        gap: 2,
        backgroundColor: theme.colors.white,
        borderRadius: theme.radii.m,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: theme.colors.gray1,
          textAlign: "center",
        }}
      >
        {monthLabels[activeMonth]}
      </Text>
      {/* Centered as a block within the popover, but left-aligned internally
          so the color dots line up regardless of each row's text length. */}
      <View style={{ alignSelf: "center", alignItems: "flex-start", gap: 2 }}>
        {selectedYears.map((year) => {
          const value = valuesByYear[year]?.[activeMonth] ?? 0;
          return (
            <View
              key={year}
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getYearColor(
                    theme,
                    availableYears.indexOf(year),
                  ),
                }}
              />
              <Text style={{ fontSize: 12, color: theme.colors.gray1 }}>
                {year}: {formatYValue(value, unitLabel)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
