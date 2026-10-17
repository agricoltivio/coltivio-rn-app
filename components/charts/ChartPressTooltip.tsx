import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";
import { getYearColor } from "./chartColors";
import { formatUnitBreakdown, UnitBreakdownEntry } from "./unitBreakdown";
import { formatSignedDelta, formatYValue } from "./unitScaling";

// Tooltip content for the touched month: total per selected year, plus — when
// getBreakdown is supplied — the unit composition behind it. Positioned and
// shown by MonthCartesianChart while the chart is touched.
export function ChartPressTooltip({
  activeMonth,
  monthLabels,
  selectedYears,
  availableYears,
  valuesByYear,
  monthlyAverages,
  unitLabel,
  perUnitLabel,
  getBreakdown,
}: {
  activeMonth: number;
  monthLabels: string[];
  selectedYears: number[];
  availableYears: number[];
  valuesByYear: Record<number, number[]>;
  // Per-month average across all years with data (not just selectedYears) —
  // a stable reference that doesn't shift as the year selection changes.
  monthlyAverages: number[];
  unitLabel: string;
  perUnitLabel: string;
  getBreakdown?: (year: number, month: number) => UnitBreakdownEntry[];
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  const average = monthlyAverages[activeMonth] ?? 0;

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
        accessibilityLabel={`${monthLabels[activeMonth]}, ${t("common.average")} ${formatYValue(average, unitLabel)}`}
      >
        {monthLabels[activeMonth]} - Ø {formatYValue(average, unitLabel)}
      </Text>
      {/* Centered as a block within the popover, but left-aligned internally
          so the color dots line up regardless of each row's text length. */}
      <View style={{ alignSelf: "center", alignItems: "flex-start", gap: 2 }}>
        {selectedYears.map((year) => {
          const value = valuesByYear[year]?.[activeMonth] ?? 0;
          const breakdown = getBreakdown?.(year, activeMonth) ?? [];
          const color = getYearColor(theme, availableYears.indexOf(year));
          return (
            <View
              key={year}
              // No wrapping here: the text wraps next to the dot instead of the
              // whole text moving below it
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  // Centered on the first text line (12pt text, ~16pt line)
                  marginTop: 4,
                  backgroundColor: color,
                }}
              />
              <Text
                style={{
                  flexShrink: 1,
                  fontSize: 12,
                  color: theme.colors.gray1,
                }}
              >
                {year}: {formatYValue(value, unitLabel)}{" "}
                <Text
                  style={{
                    color:
                      value - average >= 0
                        ? theme.colors.success
                        : theme.colors.danger,
                  }}
                >
                  ({formatSignedDelta(value - average, unitLabel)})
                </Text>
                {breakdown.length > 0
                  ? ` — ${breakdown
                      .map((entry) => formatUnitBreakdown(entry, perUnitLabel))
                      .join(", ")}`
                  : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
