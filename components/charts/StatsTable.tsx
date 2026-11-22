import { Text } from "@/components/text/Text";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { PixelRatio, Pressable, ScrollView, View } from "react-native";
import type { ScrollViewInstance } from "react-native";
import { useTheme } from "styled-components/native";
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
const STATS_FOLDED_ROW_COUNT = 6;
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
  // Shared by all cards, so all unfold together
  showAllRows?: boolean;
  onToggleShowAllRows?: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const yearsScrollRef = useRef<ScrollViewInstance>(null);
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

  // Data rows, then the "N more" / "Less" row when the table folds
  const folds =
    onToggleShowAllRows !== undefined && rows.length > STATS_FOLDED_ROW_COUNT;
  const shownRows =
    folds && !showAllRows ? rows.slice(0, STATS_FOLDED_ROW_COUNT - 1) : rows;
  const displayRows: {
    key: string;
    row?: StatsTableRow;
    toggleLabel?: string;
  }[] = shownRows.map((row) => ({ key: row.key, row }));
  if (folds) {
    displayRows.push({
      key: "toggle",
      toggleLabel: showAllRows
        ? t("buttons.show_less")
        : t("common.more_rows", { count: rows.length - shownRows.length }),
    });
  }

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
        onContentSizeChange={() =>
          yearsScrollRef.current?.scrollToEnd({ animated: false })
        }
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
