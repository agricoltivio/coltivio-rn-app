import { Text } from "@/components/text/Text";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GestureResponderEvent,
  PixelRatio,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import type { ScrollViewInstance } from "react-native";
import { useTheme } from "styled-components/native";
import { useChartPager } from "./ChartPager";
import { getYearColor } from "./chartColors";

export type StatsTableRow = {
  key: string;
  label: string;
  // year -> formatted value
  values: Record<number, string>;
  // sub row, e.g. one weight of a unit
  indented?: boolean;
};

const STATS_ROW_HEIGHT = 32;
// Longer tables show this many rows, the last one a "N more" row that unfolds them
export const STATS_FOLDED_ROW_COUNT = 6;
const STATS_YEAR_COLUMN_MIN_WIDTH = 84;
// Rough width per character at the default font size, so values like "23.5 m³/ha"
// aren't cut off
const STATS_CHARACTER_WIDTH = 9;

// Metrics as rows, one column per selected year with its chart color. The label
// column stays fixed (swiping there still turns the carousel page), the year columns
// scroll horizontally when they don't fit. Labels wrap to two lines; each label row
// measures its height and the year columns use it, so the rows stay aligned.
//
// Past STATS_FOLDED_ROW_COUNT rows the rest fold into a "N more" row (when the caller
// handles the toggle), so a card with many units doesn't make every card very tall.
export function StatsTable({
  years,
  availableYears,
  rows,
  showAllRows = false,
  onToggleShowAllRows,
}: {
  years: number[];
  availableYears: number[];
  rows: StatsTableRow[];
  // Folds again when the carousel moves to another card
  showAllRows?: boolean;
  onToggleShowAllRows?: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const yearsScrollRef = useRef<ScrollViewInstance>(null);
  const chartPager = useChartPager();

  // On iOS a swipe that runs past the end of the year columns carries on into the
  // carousel. Android's nested scroll keeps the gesture in the columns, so there a
  // drag that starts with the columns already at an end, heads further past it and
  // leaves them at that end steps the carousel instead. The columns take over the
  // touch after a few pixels (JS gets a cancel), so the first movement gives the
  // direction and the columns' drag end decides.
  const yearsScrollStateRef = useRef({
    offset: 0,
    viewportWidth: 0,
    contentWidth: 0,
  });
  const edgeSwipeRef = useRef<{
    startX: number;
    lastX: number;
    atStart: boolean;
    atEnd: boolean;
  } | null>(null);
  const edgeSwipeEnabled = Platform.OS === "android" && chartPager !== null;
  function yearsScrollEdges() {
    const { offset, viewportWidth, contentWidth } = yearsScrollStateRef.current;
    return {
      // Columns that fit don't scroll, the carousel gets those swipes itself
      scrolls: contentWidth > viewportWidth + 1,
      atStart: offset <= 1,
      atEnd: offset + viewportWidth >= contentWidth - 1,
    };
  }
  function onYearsTouchStart(event: GestureResponderEvent) {
    const { scrolls, atStart, atEnd } = yearsScrollEdges();
    const x = event.nativeEvent.pageX;
    edgeSwipeRef.current = scrolls
      ? { startX: x, lastX: x, atStart, atEnd }
      : null;
  }
  function onYearsTouchMove(event: GestureResponderEvent) {
    if (edgeSwipeRef.current) {
      edgeSwipeRef.current.lastX = event.nativeEvent.pageX;
    }
  }
  function onYearsScrollEndDrag() {
    const edgeSwipe = edgeSwipeRef.current;
    edgeSwipeRef.current = null;
    if (!edgeSwipe || !chartPager) return;
    const direction = edgeSwipe.lastX - edgeSwipe.startX;
    const edgesNow = yearsScrollEdges();
    if (edgeSwipe.atEnd && edgesNow.atEnd && direction < 0) {
      chartPager.goToPage(1);
    } else if (edgeSwipe.atStart && edgesNow.atStart && direction > 0) {
      chartPager.goToPage(-1);
    }
  }
  // row key -> height of its label row
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const rowStyle = (row?: StatsTableRow) => ({
    minHeight: STATS_ROW_HEIGHT,
    justifyContent: "center" as const,
    borderBottomWidth: row === undefined ? 1 : row.indented ? 0 : 1,
    borderBottomColor:
      row === undefined ? theme.colors.gray4 : theme.colors.gray5,
  });
  // All year columns as wide as the longest value, so the columns stay aligned
  const longestValue = Math.max(
    0,
    ...rows.flatMap((row) =>
      years.map((year) => (row.values[year] ?? "").length),
    ),
  );
  // Grows with the system font size, so larger text isn't cut off either
  const fontScale = PixelRatio.getFontScale();
  const yearColumnWidth = Math.max(
    STATS_YEAR_COLUMN_MIN_WIDTH * fontScale,
    (longestValue + 1) * STATS_CHARACTER_WIDTH * fontScale,
  );
  const textColor = (row: StatsTableRow) =>
    row.indented ? theme.colors.gray1 : theme.colors.gray0;

  const displayRows = statsDisplayRows({
    rows,
    canFold: onToggleShowAllRows !== undefined,
    showAllRows,
  }).map((displayRow) => ({
    key: displayRow.key,
    row: displayRow.kind === "row" ? displayRow.row : undefined,
    toggleLabel:
      displayRow.kind === "show-less"
        ? t("buttons.show_less")
        : displayRow.kind === "show-more"
          ? t("common.more_rows", { count: displayRow.hiddenCount })
          : undefined,
  }));

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ flex: 1 }}>
        {/* Empty header cell above the labels */}
        <View style={rowStyle()} />
        {displayRows.map(({ key, row, toggleLabel: label }) => (
          <View
            key={key}
            style={[
              rowStyle(row),
              { paddingVertical: 4 },
              row === undefined && { borderBottomWidth: 0 },
            ]}
            onLayout={(event) => {
              const height = Math.round(event.nativeEvent.layout.height);
              setRowHeights((prev) =>
                prev[key] === height ? prev : { ...prev, [key]: height },
              );
            }}
          >
            {row && (
              <Text
                numberOfLines={2}
                style={{
                  paddingLeft: row.indented ? theme.spacing.m : 0,
                  color: textColor(row),
                }}
              >
                {row.label}
              </Text>
            )}
            {label && (
              <Pressable
                onPress={onToggleShowAllRows}
                hitSlop={8}
                style={{ alignSelf: "flex-start" }}
              >
                <Text
                  style={{ color: theme.colors.primary, fontWeight: "600" }}
                >
                  {label}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
      <ScrollView
        ref={yearsScrollRef}
        horizontal
        nestedScrollEnabled
        // Start at the latest year (rightmost), also after the year selection changes
        onContentSizeChange={(contentWidth) => {
          yearsScrollStateRef.current.contentWidth = contentWidth;
          yearsScrollRef.current?.scrollToEnd({ animated: false });
        }}
        onLayout={(event) => {
          yearsScrollStateRef.current.viewportWidth =
            event.nativeEvent.layout.width;
        }}
        onScroll={(event) => {
          yearsScrollStateRef.current.offset =
            event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onTouchStart={edgeSwipeEnabled ? onYearsTouchStart : undefined}
        onTouchMove={edgeSwipeEnabled ? onYearsTouchMove : undefined}
        onScrollEndDrag={edgeSwipeEnabled ? onYearsScrollEndDrag : undefined}
        showsHorizontalScrollIndicator={false}
        // When the columns fit, a swipe on the table should still turn the carousel page
        bounces={false}
        alwaysBounceHorizontal={false}
        style={{ flexGrow: 0, maxWidth: "65%" }}
      >
        <View>
          <View style={[rowStyle(), { flexDirection: "row" }]}>
            {years.map((year) => (
              <View
                key={year}
                style={{
                  width: yearColumnWidth,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 4,
                }}
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
                <Text style={{ fontWeight: "600" }}>{year}</Text>
              </View>
            ))}
          </View>
          {displayRows.map(({ key, row }) => (
            <View
              key={key}
              style={[
                rowStyle(row),
                row === undefined && { borderBottomWidth: 0 },
                {
                  height: rowHeights[key] ?? STATS_ROW_HEIGHT,
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
            >
              {row &&
                years.map((year) => (
                  <Text
                    key={year}
                    numberOfLines={1}
                    style={{
                      width: yearColumnWidth,
                      textAlign: "right",
                      fontVariant: ["tabular-nums"],
                      color: textColor(row),
                    }}
                  >
                    {row.values[year] ?? "-"}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// The rows a table shows: its data rows, and when it is longer than
// STATS_FOLDED_ROW_COUNT either the first ones plus a "N more" row (folded) or all
// plus a "Less" row (unfolded)
export function statsDisplayRows({
  rows,
  canFold,
  showAllRows,
}: {
  rows: StatsTableRow[];
  canFold: boolean;
  showAllRows: boolean;
}): (
  | { kind: "row"; key: string; row: StatsTableRow }
  | { kind: "show-more"; key: string; hiddenCount: number }
  | { kind: "show-less"; key: string }
)[] {
  const folds = canFold && rows.length > STATS_FOLDED_ROW_COUNT;
  const shownRows =
    folds && !showAllRows ? rows.slice(0, STATS_FOLDED_ROW_COUNT - 1) : rows;
  const dataRows = shownRows.map((row) => ({
    kind: "row" as const,
    key: row.key,
    row,
  }));
  if (!folds) return dataRows;
  if (showAllRows) return [...dataRows, { kind: "show-less", key: "toggle" }];
  return [
    ...dataRows,
    {
      kind: "show-more",
      key: "toggle",
      hiddenCount: rows.length - shownRows.length,
    },
  ];
}
