import { AnimalWeight } from "@/api/breeding.api";
import { parseDateOnly } from "@/utils/date";
import { differenceInCalendarDays, addDays } from "date-fns";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { Text as SkiaText, matchFont } from "react-native-skia";
import { useTheme } from "styled-components/native";
import { Area, CartesianChart, Line, Scatter } from "victory-native";

const CHART_HEIGHT = 180;
// Points closer together than this share of the time span get no date and value label (the
// newer one keeps it), so the labels of e.g. two weighings a week apart don't overlap
const MIN_LABEL_GAP_SHARE = 0.16;

type WeightRow = { day: number; weight: number };

// Weight timeline, entries are expected sorted by date ascending. Points are placed by date,
// so the chart fits the width (no scrolling) and gaps between weighings are visible.
export function AnimalWeightChart({ weights }: { weights: AnimalWeight[] }) {
  const { i18n } = useTranslation();
  const theme = useTheme();

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
  const valueFont = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({
          ios: "Helvetica",
          android: "sans-serif",
          default: "sans-serif",
        }),
        fontSize: 11,
      }),
    [],
  );

  const firstDate = weights.length > 0 ? parseDateOnly(weights[0].date) : null;
  // x = days since the first weighing
  const rows: WeightRow[] = useMemo(() => {
    if (weights.length === 0) return [];
    const start = parseDateOnly(weights[0].date);
    return weights.map((weight) => ({
      day: differenceInCalendarDays(parseDateOnly(weight.date), start),
      weight: weight.weightKg,
    }));
  }, [weights]);

  if (!firstDate || rows.length === 0) return null;

  const weightValues = rows.map((row) => row.weight);
  // Start the y-axis below the lowest weight so changes are visible
  const yMin = Math.max(0, Math.floor(Math.min(...weightValues) * 0.9));
  const yMax = Math.ceil(Math.max(...weightValues) * 1.05);
  const lastDay = rows[rows.length - 1].day;
  // Short year ("1.6.25") keeps the labels narrow
  const formatDate = (day: number) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    }).format(addDays(firstDate, Math.round(day)));
  // Days whose point gets a date and a value: from the newest back, each far enough from the
  // last labeled one
  const minLabelGap = Math.max(1, lastDay * MIN_LABEL_GAP_SHARE);
  const labeledDays = new Set<number>();
  let lastLabeledDay: number | null = null;
  for (let index = rows.length - 1; index >= 0; index--) {
    const day = rows[index].day;
    if (lastLabeledDay === null || lastLabeledDay - day >= minLabelGap) {
      labeledDays.add(day);
      lastLabeledDay = day;
    }
  }

  return (
    <View style={{ height: CHART_HEIGHT }}>
      <CartesianChart
        data={rows}
        xKey="day"
        yKeys={["weight"]}
        // A single weighing still gets a little x range, so its point isn't on the axis
        domain={{
          x: [0, Math.max(lastDay, 1)],
          y: [yMin, Math.max(yMax, yMin + 1)],
        }}
        // Room for the date and value labels of the first and last point
        domainPadding={{ left: 28, right: 28, top: 18 }}
        xAxis={{
          font,
          tickValues: [...labeledDays].sort((a, b) => a - b),
          formatXLabel: (value) => formatDate(value),
          lineColor: theme.charts.grid,
          labelColor: theme.charts.axisLabel,
        }}
        yAxis={[
          {
            font,
            tickCount: 4,
            formatYLabel: (value) => String(value),
            lineColor: theme.charts.grid,
            labelColor: theme.charts.axisLabel,
          },
        ]}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              points={points.weight}
              y0={chartBounds.bottom}
              color={theme.colors.primary}
              opacity={0.12}
              curveType="linear"
            />
            <Line
              points={points.weight}
              color={theme.colors.primary}
              strokeWidth={2}
              curveType="linear"
            />
            <Scatter
              points={points.weight}
              radius={3.5}
              color={theme.colors.primary}
            />
            {points.weight.map((point, index) => {
              if (point.y === null || point.y === undefined) return null;
              if (!labeledDays.has(rows[index].day)) return null;
              const label = String(rows[index].weight);
              const labelWidth = valueFont.measureText(label).width;
              return (
                <SkiaText
                  key={`${point.xValue}-${index}`}
                  x={point.x - labelWidth / 2}
                  y={point.y - 8}
                  text={label}
                  font={valueFont}
                  color={theme.colors.gray1}
                />
              );
            })}
          </>
        )}
      </CartesianChart>
    </View>
  );
}
