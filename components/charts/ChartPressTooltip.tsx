import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { useTheme } from "styled-components/native";
import type { ChartPressState } from "victory-native";
import { getYearColor } from "./chartColors";
import { formatUnitBreakdown, UnitBreakdownEntry } from "./unitBreakdown";
import { formatSignedDelta, formatYValue } from "./unitScaling";

const CURRENT_MONTH = new Date().getMonth();

// Info panel above the chart: total per selected year for the touched month
// (defaulting to the current month), plus — when getBreakdown is supplied —
// the unit composition behind it. Always visible, so dragging/tapping the
// chart just changes which month it's showing rather than opening/closing it.
export function ChartPressTooltip({
  pressState,
  monthLabels,
  selectedYears,
  availableYears,
  valuesByYear,
  monthlyAverages,
  unitLabel,
  perUnitLabel,
  getBreakdown,
}: {
  pressState: ChartPressState<{ x: number; y: Record<string, number> }>;
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
  const [activeMonth, setActiveMonth] = useState(CURRENT_MONTH);

  useAnimatedReaction(
    () => (pressState.isActive.value ? pressState.matchedIndex.value : -1),
    (current, previous) => {
      if (current !== -1 && current !== previous) {
        runOnJS(setActiveMonth)(current);
      }
    },
  );

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
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 4,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: color,
                }}
              />
              <Text style={{ fontSize: 12, color: theme.colors.gray1 }}>
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
