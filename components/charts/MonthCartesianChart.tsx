import { Line as SkiaLine, matchFont, vec } from "@shopify/react-native-skia";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
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
import { ChartTooltipCard } from "./ChartTooltipCard";
import { UnitBreakdownEntry } from "./unitBreakdown";
import { formatYValue, UnitScale } from "./unitScaling";

const LAST_MONTH_INDEX = 11;
// Hold this long before the chart takes the touch and shows values, the same delay as the
// parasite charts. Shorter touches (swipes, scrolls) stay with the pager and the page.
const SCRUB_HOLD_MS = 200;

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
  // surrounding ScrollView or chart pager, so a finger landing on the chart would
  // block page scrolling and swiping between charts. We drive pressState ourselves
  // instead, via a gesture that only activates after a short hold (like the
  // parasite charts): a quick swipe or scroll moves the finger before that and
  // fails the gesture, so it goes to the pager or the page.
  const chartLeft = useSharedValue(0);
  const chartRight = useSharedValue(0);
  // Plain copy for positioning the tooltip during render (shared values
  // shouldn't be read while rendering)
  const chartBoundsRef = useRef({ left: 0, right: 0 });
  const handleChartBoundsChange = (bounds: ChartBounds) => {
    chartLeft.value = bounds.left;
    chartRight.value = bounds.right;
    chartBoundsRef.current = { left: bounds.left, right: bounds.right };
  };

  // Touched month while a finger is on the chart (-1 = not touched); drives the
  // floating tooltip and the vertical indicator line
  const [scrubbedMonth, setScrubbedMonth] = useState(-1);
  useAnimatedReaction(
    () => (pressState.isActive.value ? pressState.matchedIndex.value : -1),
    (current, previous) => {
      if (current !== previous) runOnJS(setScrubbedMonth)(current);
    },
  );
  const [chartWidth, setChartWidth] = useState(0);
  const scrubGesture = useMemo(() => {
    // Month under the finger, null while the chart bounds aren't known yet
    const monthIndexAt = (x: number) => {
      "worklet";
      const left = chartLeft.value;
      const right = chartRight.value;
      if (right <= left) return null;
      const ratio = (x - left) / (right - left);
      return Math.min(
        LAST_MONTH_INDEX,
        Math.max(0, Math.round(ratio * LAST_MONTH_INDEX)),
      );
    };
    const showMonthAt = (x: number) => {
      "worklet";
      const index = monthIndexAt(x);
      if (index === null) return;
      pressState.matchedIndex.value = index;
      pressState.isActive.value = true;
    };
    // Tap shows the tapped month's values and keeps them (tap the same month
    // again to hide). It only fires once the hold below has failed, i.e. the
    // finger lifted before SCRUB_HOLD_MS.
    const tapGesture = Gesture.Tap().onEnd((e) => {
      const index = monthIndexAt(e.x);
      if (index === null) return;
      const isSameMonth =
        pressState.isActive.value && pressState.matchedIndex.value === index;
      if (isSameMonth) {
        pressState.isActive.value = false;
        return;
      }
      pressState.matchedIndex.value = index;
      pressState.isActive.value = true;
    });
    // Hold, then drag: scrubs along the months. A quick swipe or scroll moves
    // the finger before the hold is over and fails this, so it goes to the
    // pager or the page. onEnd (not onFinalize) hides the values again, so a
    // failed hold before a tap doesn't hide what the tap shows.
    const panGesture = Gesture.Pan()
      .activateAfterLongPress(SCRUB_HOLD_MS)
      .onStart((e) => showMonthAt(e.x))
      .onUpdate((e) => showMonthAt(e.x))
      .onEnd(() => {
        pressState.isActive.value = false;
      });
    return Gesture.Exclusive(panGesture, tapGesture);
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

  // Tooltip centered above the touched month
  const { left: plotLeft, right: plotRight } = chartBoundsRef.current;
  const scrubbedMonthX =
    plotLeft +
    ((plotRight - plotLeft) * Math.max(0, scrubbedMonth)) / LAST_MONTH_INDEX;

  return (
    <View>
      <View
        style={{ height }}
        onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
      >
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
          {({ points, chartBounds }) => (
            <>
              {/* Vertical line at the touched month while dragging */}
              {scrubbedMonth >= 0 && points.y0[scrubbedMonth] !== undefined && (
                <SkiaLine
                  p1={vec(points.y0[scrubbedMonth].x, chartBounds.top)}
                  p2={vec(points.y0[scrubbedMonth].x, chartBounds.bottom)}
                  color={theme.colors.gray1}
                  strokeWidth={1}
                />
              )}
              {mode === "cumulative" ? (
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
              )}
            </>
          )}
        </CartesianChart>

        {/* Floating tooltip while the chart is touched */}
        {scrubbedMonth >= 0 && (
          <ChartTooltipCard anchorX={scrubbedMonthX} chartWidth={chartWidth}>
            <ChartPressTooltip
              activeMonth={scrubbedMonth}
              monthLabels={monthLabelsFull}
              selectedYears={selectedYears}
              availableYears={availableYears}
              valuesByYear={valuesByYear}
              monthlyAverages={monthlyAverages}
              unitLabel={unit.label}
              perUnitLabel={perUnitLabel}
              getBreakdown={getBreakdown}
            />
          </ChartTooltipCard>
        )}
      </View>
    </View>
  );
}
