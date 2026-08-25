import { matchFont } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { useTheme } from "styled-components/native";
import {
  BarGroup,
  CartesianChart,
  Line,
  useChartPressState,
  type ChartBounds,
} from "victory-native";
import { getYearColor } from "./chartColors";
import { ChartMode } from "./ChartViewSwitcher";
import { ChartPressTooltip } from "./ChartPressTooltip";
import { UnitBreakdownEntry } from "./unitBreakdown";
import { formatYValue, UnitScale } from "./unitScaling";

const LAST_MONTH_INDEX = 11;
// How far a touch must move horizontally/vertically before we decide it's a
// chart scrub vs. a page scroll. Below this, direction is ambiguous either way.
const DIRECTION_THRESHOLD = 10;

type Row = {
  month: number;
  y0?: number;
  y1?: number;
  y2?: number;
  y3?: number;
  y4?: number;
};

// Scales raw per-year monthly totals to display units for the given years:
// running totals for "cumulative" mode, raw per-month totals for "monthly".
function scaleYearValues(
  monthlyData: Record<number, number[]>,
  years: number[],
  mode: ChartMode,
  divisor: number,
): Record<number, number[]> {
  const result: Record<number, number[]> = {};
  for (const year of years) {
    const raw = monthlyData[year] ?? new Array(12).fill(0);
    if (mode === "cumulative") {
      let cumulative = 0;
      result[year] = raw.map((v) => {
        cumulative += v;
        return cumulative / divisor;
      });
    } else {
      result[year] = raw.map((v) => v / divisor);
    }
  }
  return result;
}

const Y_KEY_LIST = ["y0", "y1", "y2", "y3", "y4"] as const;
type YKey = (typeof Y_KEY_LIST)[number];
const ALL_Y_KEYS: YKey[] = [...Y_KEY_LIST];
const INITIAL_PRESS_Y: Record<YKey, number> = {
  y0: 0,
  y1: 0,
  y2: 0,
  y3: 0,
  y4: 0,
};

export type MonthCartesianChartProps = {
  mode: ChartMode;
  // year -> 12 raw monthly values (not yet scaled to the display unit). May
  // include years beyond selectedYears — those aren't plotted but do feed
  // the info panel's all-years average.
  monthlyData: Record<number, number[]>;
  selectedYears: number[];
  availableYears: number[];
  unit: UnitScale;
  // unit label used inside breakdown lines, e.g. "kg" for "10 crates × 20kg"
  perUnitLabel: string;
  getBreakdown?: (year: number, month: number) => UnitBreakdownEntry[];
  height?: number;
};

// Cartesian chart shared by the field-calendar dashboards: one line (cumulative)
// or grouped-bar (monthly) series per selected year, with a drag-to-scrub
// info panel (defaulting to the current month) instead of tiny per-point tap
// targets.
export function MonthCartesianChart({
  mode,
  monthlyData,
  selectedYears,
  availableYears,
  unit,
  perUnitLabel,
  getBreakdown,
  height = 220,
}: MonthCartesianChartProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();

  // Short labels for the axis (space-constrained), full names for the info
  // panel where there's room to spell them out.
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat(i18n.language, { month: "short" }).format(
          new Date(2024, i),
        ),
      ),
    [i18n.language],
  );
  const monthLabelsFull = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat(i18n.language, { month: "long" }).format(
          new Date(2024, i),
        ),
      ),
    [i18n.language],
  );

  const font = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({
          ios: "Helvetica",
          android: "sans-serif",
          default: "sans-serif",
        }),
        fontSize: 10,
      }),
    [],
  );

  const { state: pressState } = useChartPressState({
    x: 0,
    y: INITIAL_PRESS_Y,
  });

  // victory-native's own chartPressState gesture has no way to defer to a
  // surrounding ScrollView, so a finger landing on the chart blocks page
  // scrolling entirely. We drive pressState ourselves instead, via a gesture
  // that only activates once a touch has clearly moved horizontally
  // (failing — and releasing to the ScrollView — on vertical movement first).
  const chartLeft = useSharedValue(0);
  const chartRight = useSharedValue(0);
  const handleChartBoundsChange = (bounds: ChartBounds) => {
    chartLeft.value = bounds.left;
    chartRight.value = bounds.right;
  };
  const scrubGesture = useMemo(() => {
    const updateFromX = (x: number) => {
      "worklet";
      const left = chartLeft.value;
      const right = chartRight.value;
      if (right <= left) return;
      const ratio = (x - left) / (right - left);
      const index = Math.round(ratio * LAST_MONTH_INDEX);
      pressState.matchedIndex.value = Math.min(
        LAST_MONTH_INDEX,
        Math.max(0, index),
      );
      pressState.isActive.value = true;
    };
    // onBegin fires on touch-down, before the gesture has committed to
    // either activating (horizontal drag) or failing (vertical scroll) — so
    // a plain tap/hold updates the info panel immediately instead of needing
    // horizontal movement first. The panel is always visible (see
    // ChartPressTooltip), so a touch that turns out to be a scroll just
    // leaves it on whatever month it last landed on — nothing to hide.
    const panGesture = Gesture.Pan()
      .activeOffsetX([-DIRECTION_THRESHOLD, DIRECTION_THRESHOLD])
      .failOffsetY([-DIRECTION_THRESHOLD, DIRECTION_THRESHOLD])
      .onBegin((e) => updateFromX(e.x))
      .onUpdate((e) => updateFromX(e.x));
    return Gesture.Race(panGesture);
  }, [chartLeft, chartRight, pressState]);

  // Per-year, per-month values in display units, for the selected years
  // (what's actually plotted).
  const valuesByYear = useMemo(
    () => scaleYearValues(monthlyData, selectedYears, mode, unit.divisor),
    [monthlyData, selectedYears, mode, unit.divisor],
  );

  // Per-month average across every year present in monthlyData (not just
  // selectedYears) — a stable historical reference that doesn't change as
  // the year selection changes.
  const monthlyAverages = useMemo(() => {
    const allYears = Object.keys(monthlyData).map(Number);
    if (allYears.length === 0) return new Array(12).fill(0);
    const scaled = scaleYearValues(monthlyData, allYears, mode, unit.divisor);
    return Array.from(
      { length: 12 },
      (_, month) =>
        allYears.reduce((sum, year) => sum + (scaled[year]?.[month] ?? 0), 0) /
        allYears.length,
    );
  }, [monthlyData, mode, unit.divisor]);

  const rows: Row[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => {
        const row: Row = { month };
        selectedYears.forEach((year, i) => {
          if (i < ALL_Y_KEYS.length) {
            row[ALL_Y_KEYS[i]] = valuesByYear[year]?.[month] ?? 0;
          }
        });
        return row;
      }),
    [selectedYears, valuesByYear],
  );

  const domainMax = useMemo(() => {
    let dataMax = 0;
    for (const year of selectedYears) {
      for (const v of valuesByYear[year] ?? []) {
        if (v > dataMax) dataMax = v;
      }
    }
    return dataMax === 0 ? 10 : dataMax * 1.15;
  }, [selectedYears, valuesByYear]);

  if (selectedYears.length === 0) return null;

  return (
    <View style={{ gap: 4 }}>
      <ChartPressTooltip
        pressState={pressState}
        monthLabels={monthLabelsFull}
        selectedYears={selectedYears}
        availableYears={availableYears}
        valuesByYear={valuesByYear}
        monthlyAverages={monthlyAverages}
        unitLabel={unit.label}
        perUnitLabel={perUnitLabel}
        getBreakdown={getBreakdown}
      />
      <View style={{ height }}>
        <CartesianChart
          data={rows}
          xKey="month"
          yKeys={ALL_Y_KEYS}
          domain={{ y: [0, domainMax] }}
          domainPadding={{ left: 16, right: 16, top: 12 }}
          onChartBoundsChange={handleChartBoundsChange}
          customGestures={scrubGesture}
          xAxis={{
            font,
            tickValues: Array.from({ length: 12 }, (_, i) => i),
            formatXLabel: (value) => monthLabels[value] ?? "",
            lineColor: theme.charts.grid,
            labelColor: theme.charts.axisLabel,
          }}
          yAxis={[
            {
              font,
              tickCount: 4,
              formatYLabel: (value) => formatYValue(value ?? 0, unit.label),
              lineColor: theme.charts.grid,
              labelColor: theme.charts.axisLabel,
            },
          ]}
        >
          {({ points, chartBounds }) =>
            mode === "cumulative" ? (
              <>
                {selectedYears.map((year, i) => (
                  <Line
                    key={year}
                    points={points[ALL_Y_KEYS[i]]}
                    color={getYearColor(theme, availableYears.indexOf(year))}
                    strokeWidth={2}
                    curveType="linear"
                    connectMissingData
                  />
                ))}
              </>
            ) : (
              <BarGroup
                chartBounds={chartBounds}
                barCount={selectedYears.length}
                betweenGroupPadding={0.4}
                withinGroupPadding={0.15}
                roundedCorners={{ topLeft: 4, topRight: 4 }}
              >
                {selectedYears.map((year, i) => (
                  <BarGroup.Bar
                    key={year}
                    points={points[ALL_Y_KEYS[i]]}
                    color={getYearColor(theme, availableYears.indexOf(year))}
                  />
                ))}
              </BarGroup>
            )
          }
        </CartesianChart>
      </View>
    </View>
  );
}
