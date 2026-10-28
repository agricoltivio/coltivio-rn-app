import {
  ParasiteResult,
  ParasiteResultGrade,
  ParasiteType,
} from "@/api/parasite-checks.api";
import { ChartTooltipCard } from "@/components/charts/ChartTooltipCard";
import { Text } from "@/components/text/Text";
import { Subtitle } from "@/theme/Typography";
import { parseDateOnly } from "@/utils/date";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  Circle,
  G,
  Line,
  Polyline,
  Svg,
  Text as SvgText,
} from "react-native-svg";
import { useTheme } from "styled-components/native";

// FAMACHA card colors: 1 = red mucosa (healthy) … 5 = white (severely anaemic)
export const FAMACHA_COLORS: Record<number, string> = {
  1: "#B71C1C",
  2: "#E53935",
  3: "#F06292",
  4: "#F8BBD0",
  5: "#FDF2F5",
};

export const FAMACHA_TEXT_COLORS: Record<number, string> = {
  1: "#FFFFFF",
  2: "#FFFFFF",
  3: "#FFFFFF",
  4: "#5D4037",
  5: "#5D4037",
};

// Ordered from none to most; the index is the value on a grade chart axis
export const PARASITE_RESULT_GRADES: ParasiteResultGrade[] = [
  "negative",
  "low",
  "medium",
  "high",
];

export const PARASITE_TYPES: ParasiteType[] = [
  "strongyles",
  "haemonchus",
  "nematodirus",
  "trichuris",
  "capillaria",
  "strongyloides",
  "moniezia",
  "coccidia",
  "liver_fluke",
  "small_liver_fluke",
  "lungworm",
  "other",
];

// Tap targets for FAMACHA 1–5 in the colors of the FAMACHA card
export function FamachaScorePicker({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (score: number | null) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((score) => {
        const selected = value === score;
        return (
          <TouchableOpacity
            key={score}
            disabled={disabled}
            // Tapping the selected score again clears it
            onPress={() => onChange(selected ? null : score)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: FAMACHA_COLORS[score],
              borderWidth: selected ? 3 : 1,
              borderColor: selected ? theme.colors.primary : theme.colors.gray3,
              opacity: value === null || selected ? 1 : 0.35,
            }}
          >
            <Subtitle
              style={{
                color: FAMACHA_TEXT_COLORS[score],
                fontWeight: "700",
                fontSize: 15,
              }}
            >
              {score}
            </Subtitle>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function FamachaBadge({ score }: { score: number }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: FAMACHA_COLORS[score],
        borderWidth: 1,
        borderColor: theme.colors.gray3,
      }}
    >
      <Subtitle
        style={{
          color: FAMACHA_TEXT_COLORS[score],
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {score}
      </Subtitle>
    </View>
  );
}

// coverage: how many animals (or samples) the value is based on, shown above the
// point and in the tooltip
export type TimelinePoint = { date: Date; value: number; coverage?: number };

// Line chart over time with optional vertical markers (e.g. treatments)
// Only the latest points are shown so long histories don't get cramped
const MAX_TIMELINE_POINTS = 10;
// Lower bound for an automatic y axis, so tiny counts don't look dramatic
const MIN_AUTO_MAX_VALUE = 100;

export function TimelineChart({
  points: allPoints,
  markers = [],
  minValue,
  maxValue: fixedMaxValue,
  invertY = false,
  gradeScale = false,
  averageValues = false,
  coverageKind = "animals",
  unitLabel,
  color,
  height = 140,
}: {
  points: TimelinePoint[];
  markers?: Date[];
  minValue: number;
  // Omitted: scales to the visible points (at least MIN_AUTO_MAX_VALUE)
  maxValue?: number;
  // FAMACHA: 1 (good) at the top
  invertY?: boolean;
  // Grades: fixed 0–3 axis (index in PARASITE_RESULT_GRADES) labelled – / + / ++ / +++
  gradeScale?: boolean;
  // Values are averages per check: the tooltip shows "Ø"
  averageValues?: boolean;
  // What a point's coverage counts, shown in the tooltip ("12 Tiere" / "3 Proben")
  coverageKind?: "animals" | "samples";
  // Shown after the value in the tooltip, e.g. "EpG" or "%"
  unitLabel?: string;
  color: string;
  height?: number;
}) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [width, setWidth] = useState(0);
  // Index of the touched point in the visible points; null = no tooltip
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function onLayout(event: LayoutChangeEvent) {
    setWidth(event.nativeEvent.layout.width);
  }

  const points = [...allPoints]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-MAX_TIMELINE_POINTS);
  const isTruncated = allPoints.length > points.length;
  const maxValue = gradeScale
    ? PARASITE_RESULT_GRADES.length - 1
    : (fixedMaxValue ??
      Math.max(MIN_AUTO_MAX_VALUE, ...points.map((point) => point.value)));

  // Room for the y labels (e.g. "-100", "+++") plus a gap to the plot
  const paddingLeft = 42;
  const paddingRight = 12;
  // Room for the labels above the points
  const paddingTop = 18;
  const paddingBottom = 22;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // The time range follows the data points only; markers outside it (e.g. an
  // unrelated treatment years earlier) are left out instead of stretching the chart
  const pointTimes = points.map((point) => point.date.getTime());
  const minTime = Math.min(...pointTimes);
  const maxTime = Math.max(...pointTimes);
  const visibleMarkers = markers.filter(
    (marker) =>
      marker.getTime() >= minTime &&
      marker.getTime() <= maxTime &&
      // A single point has no range to place markers in
      maxTime > minTime,
  );
  const timeSpan = Math.max(maxTime - minTime, 1);
  const valueSpan = Math.max(maxValue - minValue, 1);

  function xFor(date: Date) {
    // A single point is centered
    if (maxTime === minTime) return paddingLeft + plotWidth / 2;
    return paddingLeft + ((date.getTime() - minTime) / timeSpan) * plotWidth;
  }
  function yFor(value: number) {
    const ratio = (value - minValue) / valueSpan;
    return paddingTop + (invertY ? ratio : 1 - ratio) * plotHeight;
  }

  const sortedPoints = points;
  const yTicks = gradeScale
    ? PARASITE_RESULT_GRADES.map((_grade, index) => index)
    : [minValue, (minValue + maxValue) / 2, maxValue];
  function tickLabel(tick: number) {
    if (gradeScale) {
      const grade = PARASITE_RESULT_GRADES[tick];
      return grade ? t(`parasite_checks.grades_short.${grade}`) : "";
    }
    return String(Number.isInteger(tick) ? tick : Math.round(tick));
  }
  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    month: "short",
    year: "2-digit",
  });

  function nearestPointIndex(touchX: number) {
    let nearestIndex = 0;
    points.forEach((point, index) => {
      if (
        Math.abs(xFor(point.date) - touchX) <
        Math.abs(xFor(points[nearestIndex].date) - touchX)
      )
        nearestIndex = index;
    });
    return nearestIndex;
  }

  // Tap shows the nearest point's value (tap it again to hide); hold and drag
  // scrubs through the points. A plain horizontal swipe stays with the
  // surrounding chart pager.
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((event) => {
      const touchedIndex = nearestPointIndex(event.x);
      setActiveIndex((current) =>
        current === touchedIndex ? null : touchedIndex,
      );
    });
  const scrubGesture = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(200)
    .onStart((event) => setActiveIndex(nearestPointIndex(event.x)))
    .onUpdate((event) => setActiveIndex(nearestPointIndex(event.x)));
  const chartGesture = Gesture.Exclusive(scrubGesture, tapGesture);

  // Like the web: "150 EpG", "++ mittel"; averages "Ø 150 EpG",
  // "Ø ++ mittel (1.6)" (nearest step and the exact value)
  function formatTooltipValue(value: number) {
    const rounded = Math.round(value * 10) / 10;
    const averagePrefix = averageValues ? "Ø " : "";
    if (gradeScale) {
      const grade = PARASITE_RESULT_GRADES[Math.round(value)];
      if (!grade) return "";
      const gradeLabel = t(`parasite_checks.grades.${grade}`);
      return Number.isInteger(value)
        ? `${averagePrefix}${gradeLabel}`
        : `${averagePrefix}${gradeLabel} (${rounded})`;
    }
    return `${averagePrefix}${rounded}${unitLabel ? ` ${unitLabel}` : ""}`;
  }
  // Data can reload with fewer points while a tooltip is open
  const activePoint = activeIndex !== null ? points[activeIndex] : undefined;
  const tooltipDateFormatter = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
  });

  return (
    <View onLayout={onLayout} style={{ width: "100%" }}>
      {/* Above the chart with some space, so it doesn't sit on the top gridline */}
      {isTruncated && (
        <Subtitle
          style={{
            alignSelf: "flex-end",
            fontSize: 11,
            color: theme.colors.gray2,
            marginBottom: theme.spacing.xs,
          }}
        >
          {t("parasite_checks.last_n_values", { count: MAX_TIMELINE_POINTS })}
        </Subtitle>
      )}
      {width > 0 && points.length > 0 ? (
        <GestureDetector gesture={chartGesture}>
          <View>
            <Svg width={width} height={height}>
              {yTicks.map((tick) => (
                <G key={tick}>
                  <Line
                    x1={paddingLeft}
                    y1={yFor(tick)}
                    x2={paddingLeft + plotWidth}
                    y2={yFor(tick)}
                    stroke={theme.colors.gray4}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={paddingLeft - 10}
                    y={yFor(tick) + 3}
                    fontSize={9}
                    fill={theme.colors.gray2}
                    textAnchor="end"
                  >
                    {tickLabel(tick)}
                  </SvgText>
                </G>
              ))}
              {visibleMarkers.map((marker, index) => (
                <Line
                  key={`marker-${index}`}
                  x1={xFor(marker)}
                  y1={paddingTop}
                  x2={xFor(marker)}
                  y2={paddingTop + plotHeight}
                  stroke={theme.colors.warning}
                  strokeWidth={1.5}
                  strokeDasharray="4,3"
                />
              ))}
              {/* Vertical line at the touched point */}
              {activePoint && (
                <Line
                  x1={xFor(activePoint.date)}
                  y1={paddingTop}
                  x2={xFor(activePoint.date)}
                  y2={paddingTop + plotHeight}
                  stroke={theme.colors.gray1}
                  strokeWidth={1}
                />
              )}
              {sortedPoints.length > 1 && (
                <Polyline
                  points={sortedPoints
                    .map((point) => `${xFor(point.date)},${yFor(point.value)}`)
                    .join(" ")}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                />
              )}
              {sortedPoints.map((point, index) => (
                <G key={index}>
                  <Circle
                    cx={xFor(point.date)}
                    cy={yFor(point.value)}
                    r={index === activeIndex ? 6 : 4}
                    fill={color}
                  />
                  {point.coverage !== undefined && (
                    <SvgText
                      x={xFor(point.date)}
                      y={yFor(point.value) - 7}
                      fontSize={9}
                      fill={theme.colors.gray2}
                      textAnchor="middle"
                    >
                      {point.coverage}
                    </SvgText>
                  )}
                </G>
              ))}
              <SvgText
                x={paddingLeft}
                y={height - 6}
                fontSize={9}
                fill={theme.colors.gray2}
                textAnchor="start"
              >
                {dateFormatter.format(new Date(minTime))}
              </SvgText>
              {maxTime !== minTime && (
                <SvgText
                  x={paddingLeft + plotWidth}
                  y={height - 6}
                  fontSize={9}
                  fill={theme.colors.gray2}
                  textAnchor="end"
                >
                  {dateFormatter.format(new Date(maxTime))}
                </SvgText>
              )}
            </Svg>
            {activePoint && (
              <ChartTooltipCard
                anchorX={xFor(activePoint.date)}
                chartWidth={width}
              >
                <View
                  style={{
                    paddingHorizontal: theme.spacing.s,
                    paddingVertical: theme.spacing.xs,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: theme.colors.gray1,
                    }}
                  >
                    {tooltipDateFormatter.format(activePoint.date)}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.colors.gray1 }}>
                    {formatTooltipValue(activePoint.value)}
                  </Text>
                  {activePoint.coverage !== undefined && (
                    <Text style={{ fontSize: 12, color: theme.colors.gray2 }}>
                      {t(
                        coverageKind === "samples"
                          ? "parasite_checks.n_samples"
                          : "parasite_checks.n_animals",
                        { count: activePoint.coverage },
                      )}
                    </Text>
                  )}
                </View>
              </ChartTooltipCard>
            )}
          </View>
        </GestureDetector>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}

export type FamachaChartCheck = {
  id: string;
  date: string;
  famachaAverage: number | null;
  animals: { animalId: string; famachaScore: number | null }[];
};

// One horizontal bar per FAMACHA check (oldest on top), split into the scores
// with the number of animals in each segment
export function FamachaDistributionRows({
  checks,
  height = 140,
  grow = false,
}: {
  checks: FamachaChartCheck[];
  // Same as the line charts so cards in a pager line up; older rows scroll
  height?: number;
  // Grow with the rows up to `height` instead of always taking it (when no
  // other cards need to line up)
  grow?: boolean;
}) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const dateFormatter = new Intl.DateTimeFormat(i18n.language, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  // Newest on top
  const sortedChecks = [...checks].sort(
    (a, b) => parseDateOnly(b.date).getTime() - parseDateOnly(a.date).getTime(),
  );

  return (
    <ScrollView
      style={grow ? { maxHeight: height } : { height }}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      // Few rows sit at the bottom, like on a chart baseline
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "flex-end",
        gap: 6,
      }}
    >
      {sortedChecks.map((check) => {
        const counts = [1, 2, 3, 4, 5].map((score) => ({
          score,
          count: check.animals.filter(
            (checkAnimal) => checkAnimal.famachaScore === score,
          ).length,
        }));
        return (
          <View
            key={check.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <Subtitle
              style={{ width: 64, fontSize: 12, color: theme.colors.gray2 }}
            >
              {dateFormatter.format(parseDateOnly(check.date))}
            </Subtitle>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                height: 24,
                borderRadius: 6,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: theme.colors.gray3,
              }}
            >
              {counts
                .filter((entry) => entry.count > 0)
                .map((entry, index) => (
                  <View
                    key={entry.score}
                    style={{
                      flex: entry.count,
                      minWidth: 16,
                      backgroundColor: FAMACHA_COLORS[entry.score],
                      alignItems: "center",
                      justifyContent: "center",
                      borderLeftWidth: index === 0 ? 0 : 1,
                      borderLeftColor: theme.colors.gray3,
                    }}
                  >
                    <Subtitle
                      numberOfLines={1}
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: FAMACHA_TEXT_COLORS[entry.score],
                      }}
                    >
                      {entry.count}
                    </Subtitle>
                  </View>
                ))}
            </View>
            {/* Number of scored animals */}
            <Subtitle
              style={{
                width: 28,
                fontSize: 11,
                color: theme.colors.gray2,
                textAlign: "right",
              }}
            >
              {counts.reduce((sum, entry) => sum + entry.count, 0)}
            </Subtitle>
          </View>
        );
      })}
    </ScrollView>
  );
}

// Labs count oocysts for coccidia and larvae for lungworms, eggs for all others
export function parasiteCountUnitKey(parasiteType: ParasiteType) {
  if (parasiteType === "coccidia") return "parasite_checks.count_units.opg";
  if (parasiteType === "lungworm") return "parasite_checks.count_units.lpg";
  return "parasite_checks.count_units.epg";
}

// Animals are shown by name, the ear tag only when they have no name
export function animalDisplayName(
  name: string,
  earTagNumber: string | null | undefined,
): string {
  return name.trim() || earTagNumber || "–";
}

// The API returns the reduction (1 - after / before); shown as the change instead,
// so an increase from 5 to 20 reads "+300%" and a drop from 1000 to 50 "-95%"
export function formatCountChange(reductionPercent: number | null): string {
  if (reductionPercent === null) return "–";
  const changePercent = Math.round(-reductionPercent);
  return `${changePercent > 0 ? "+" : ""}${changePercent}%`;
}

// "150 EpG" for a count, "++" for a grade
export function formatResultValue(
  result: ParasiteResult,
  t: (key: string) => string,
): string {
  if (result.grade !== null)
    return t(`parasite_checks.grades_short.${result.grade}`);
  return `${Math.round(result.countPerGram ?? 0)} ${t(parasiteCountUnitKey(result.parasiteType))}`;
}
