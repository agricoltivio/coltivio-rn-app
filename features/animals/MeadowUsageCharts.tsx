import { Card } from "@/components/card/Card";
import { YearMultiSelect } from "@/components/charts/YearMultiSelect";
import { Text } from "@/components/text/Text";
import { Line as SkiaLine, matchFont, vec } from "@shopify/react-native-skia";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, View } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useTheme } from "styled-components/native";
import { Bar, CartesianChart, type ChartBounds } from "victory-native";
import { MeadowMonthlyUsage } from "./meadow-usage-utils";

// Fixed order, as in the API
const ANIMAL_TYPES = [
  "goat",
  "sheep",
  "cow",
  "horse",
  "donkey",
  "pig",
  "deer",
] as const;
type AnimalType = (typeof ANIMAL_TYPES)[number];

type AverageAnimalsRow = { month: number } & Record<AnimalType, number>;
type OccupiedDaysRow = { month: number; days: number };

// How far a touch must move before it counts as a horizontal scrub rather than
// a page scroll (same as the field-calendar charts)
const DIRECTION_THRESHOLD = 10;
const CHART_HEIGHT = 220;

type MeadowUsageChartsProps = {
  usage: MeadowMonthlyUsage;
  year: number;
  // Year chips inside the card, as on the field-calendar dashboards
  availableYears: number[];
  onSelectYear: (year: number) => void;
};

// A meadow's year: occupied days per month as a chart ("how long"), and the
// selected month's average animals per type in the panel above ("how many"). Touching either chart selects a month, whose
// details are shown in the panel above.
export function MeadowUsageCharts({
  usage,
  year,
  availableYears,
  onSelectYear,
}: MeadowUsageChartsProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const today = new Date();
  // True while a finger is on the chart; shows the vertical month indicator
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(
    year === today.getFullYear() ? today.getMonth() : 0,
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
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) =>
        new Intl.DateTimeFormat(i18n.language, { month: "short" }).format(
          new Date(2024, month),
        ),
      ),
    [i18n.language],
  );
  const monthNameFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: "long" }),
    [i18n.language],
  );

  const typeLabels: Record<AnimalType, string> = {
    goat: t("animals.animal_types.goat"),
    sheep: t("animals.animal_types.sheep"),
    cow: t("animals.animal_types.cow"),
    horse: t("animals.animal_types.horse"),
    donkey: t("animals.animal_types.donkey"),
    pig: t("animals.animal_types.pig"),
    deer: t("animals.animal_types.deer"),
  };

  // Only types that were on the meadow this year get a series
  const presentTypes = ANIMAL_TYPES.filter((animalType) =>
    (usage.animalDaysByType[animalType] ?? []).some((value) => value > 0),
  );

  // Average animals per type on the days the meadow was occupied:
  // animal-days of the month ÷ occupied days, rounded to one decimal
  const averageAnimalsRows = useMemo((): AverageAnimalsRow[] => {
    const average = (animalType: AnimalType, month: number) => {
      const occupiedDays = usage.occupiedDays[month];
      const animalDays = usage.animalDaysByType[animalType]?.[month] ?? 0;
      return occupiedDays > 0
        ? Math.round((animalDays / occupiedDays) * 10) / 10
        : 0;
    };
    return Array.from({ length: 12 }, (_, month) => ({
      month,
      goat: average("goat", month),
      sheep: average("sheep", month),
      cow: average("cow", month),
      horse: average("horse", month),
      donkey: average("donkey", month),
      pig: average("pig", month),
      deer: average("deer", month),
    }));
  }, [usage]);
  const occupiedDaysRows = useMemo(
    (): OccupiedDaysRow[] =>
      usage.occupiedDays.map((days, month) => ({ month, days })),
    [usage],
  );

  // Touching the chart selects a month: map the touch x to a month within the
  // chart's plot area
  const chartBoundsRef = useRef({ left: 0, right: 0 });
  const handleChartBoundsChange = (bounds: ChartBounds) => {
    chartBoundsRef.current = { left: bounds.left, right: bounds.right };
  };
  const occupiedDaysGesture = useMemo(() => {
    const updateFromX = (x: number) => {
      const { left, right } = chartBoundsRef.current;
      if (right <= left) return;
      const month = Math.round(((x - left) / (right - left)) * 11);
      setSelectedMonth(Math.min(11, Math.max(0, month)));
    };
    const createScrubGesture = () =>
      Gesture.Race(
        Gesture.Pan()
          .runOnJS(true)
          .activeOffsetX([-DIRECTION_THRESHOLD, DIRECTION_THRESHOLD])
          .failOffsetY([-DIRECTION_THRESHOLD, DIRECTION_THRESHOLD])
          .onBegin((event) => {
            setIsScrubbing(true);
            updateFromX(event.x);
          })
          .onUpdate((event) => updateFromX(event.x))
          .onFinalize(() => setIsScrubbing(false)),
      );
    return createScrubGesture();
  }, []);

  const xAxis = {
    font,
    tickValues: Array.from({ length: 12 }, (_, month) => month),
    formatXLabel: (value: number) => monthLabels[value] ?? "",
    lineColor: theme.charts.grid,
    labelColor: theme.charts.axisLabel,
  };

  // Tooltip centered above the selected month, kept inside the chart
  const { left: plotLeft, right: plotRight } = chartBoundsRef.current;
  const selectedMonthX =
    plotLeft + ((plotRight - plotLeft) * selectedMonth) / 11;
  const tooltipLeft = Math.min(
    Math.max(0, selectedMonthX - tooltipWidth / 2),
    Math.max(0, chartWidth - tooltipWidth),
  );

  // Details of the selected month
  const selectedOccupiedDays = usage.occupiedDays[selectedMonth];
  const selectedTypeDetails = presentTypes
    .map((animalType) => ({
      animalType,
      averageAnimals: averageAnimalsRows[selectedMonth][animalType],
    }))
    .filter(({ averageAnimals }) => averageAnimals > 0);

  return (
    // Same card layout as the field-calendar dashboard charts
    <Card>
      <Card.Title>{t("animals.meadows.usage_chart.days_title")}</Card.Title>
      <Card.Content style={{ gap: theme.spacing.s }}>
        {availableYears.length > 1 && (
          <YearMultiSelect
            years={availableYears}
            selectedYears={[year]}
            onToggle={onSelectYear}
          />
        )}

        <View
          style={{ height: CHART_HEIGHT }}
          onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
        >
          <CartesianChart
            data={occupiedDaysRows}
            xKey="month"
            yKeys={["days"]}
            domain={{ y: [0, 31] }}
            domainPadding={{ left: 14, right: 14, top: 8 }}
            onChartBoundsChange={handleChartBoundsChange}
            customGestures={occupiedDaysGesture}
            xAxis={xAxis}
            yAxis={[
              {
                font,
                tickValues: [0, 10, 20, 31],
                formatYLabel: (value) => String(Math.round(value ?? 0)),
                lineColor: theme.charts.grid,
                labelColor: theme.charts.axisLabel,
              },
            ]}
          >
            {({ points, chartBounds }) => {
              const selectedX = points.days[selectedMonth]?.x;
              return (
                <>
                  <Bar
                    points={points.days}
                    chartBounds={chartBounds}
                    color={theme.colors.primary}
                    innerPadding={0.35}
                    roundedCorners={{ topLeft: 4, topRight: 4 }}
                  />
                  {/* Vertical line at the selected month while dragging */}
                  {isScrubbing && selectedX !== undefined && (
                    <SkiaLine
                      p1={vec(selectedX, chartBounds.top)}
                      p2={vec(selectedX, chartBounds.bottom)}
                      color={theme.colors.gray1}
                      strokeWidth={1}
                    />
                  )}
                </>
              );
            }}
          </CartesianChart>
          {/* Floating details of the selected month while dragging; positioned over
              the chart so its size doesn't move the chart */}
          {isScrubbing && (
            <View
              pointerEvents="none"
              onLayout={(event) =>
                setTooltipWidth(event.nativeEvent.layout.width)
              }
              style={{
                position: "absolute",
                top: 0,
                left: tooltipLeft,
                gap: 2,
                backgroundColor: theme.colors.white,
                borderRadius: theme.radii.m,
                paddingHorizontal: theme.spacing.s,
                paddingVertical: theme.spacing.xs,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 4,
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
                {monthNameFormatter.format(new Date(year, selectedMonth))} -{" "}
                {t("animals.meadows.usage_chart.days_value", {
                  count: selectedOccupiedDays,
                })}
              </Text>
              {selectedTypeDetails.map(({ animalType, averageAnimals }) => (
                <Text
                  key={animalType}
                  style={{
                    fontSize: 12,
                    color: theme.colors.gray1,
                    textAlign: "center",
                  }}
                >
                  {typeLabels[animalType]}:{" "}
                  {t("animals.meadows.usage_chart.average_animals_value", {
                    averageAnimals,
                  })}
                </Text>
              ))}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}
