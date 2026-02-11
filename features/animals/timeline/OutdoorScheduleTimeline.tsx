import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  scrollTo,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import {
  GridLine,
  getAllGridLines,
  getAllWeekLines,
} from "@/features/crop-rotations/timeline/timeline-utils";
import {
  TimelineHeader,
  TIMELINE_HEADER_HEIGHT,
} from "@/features/crop-rotations/timeline/TimelineHeader";
import {
  ZoomLevel,
  getScaleForZoomLevel,
} from "@/features/crop-rotations/timeline/ZoomLevelToggle";
import { OutdoorTimelineData, OutdoorHerdData } from "./outdoor-timeline-utils";
import { OutdoorTimelineHerdRow, ROW_HEIGHT } from "./OutdoorTimelineHerdRow";
import { scheduleOnRN } from "react-native-worklets";

type OutdoorScheduleTimelineProps = {
  timelineData: OutdoorTimelineData;
  onBarPress: (scheduleId: string) => void;
};

const LABEL_WIDTH = 100;
const MS_PER_DAY = 86_400_000;
const YEAR_ROW_HEIGHT = 20;
const WEEK_ROW_HEIGHT = 20;

// Animated sticky year label
type StickyYearLabelProps = {
  year: number;
  yearStartPx: number;
  yearEndPx: number;
  scrollX: SharedValue<number>;
  viewportWidth: number;
  color: string;
};

const StickyYearLabel = memo(function StickyYearLabel({
  year,
  yearStartPx,
  yearEndPx,
  scrollX,
  viewportWidth,
  color,
}: StickyYearLabelProps) {
  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const viewportStartPx = scrollX.value;
    const viewportEndPx = scrollX.value + viewportWidth;

    if (yearEndPx < viewportStartPx || yearStartPx > viewportEndPx) {
      return { opacity: 0, transform: [{ translateX: 0 }] };
    }

    const visibleStartPx = Math.max(yearStartPx, viewportStartPx);
    const visibleEndPx = Math.min(yearEndPx, viewportEndPx);
    const labelX = (visibleStartPx + visibleEndPx) / 2 - viewportStartPx;

    return {
      opacity: 1,
      transform: [{ translateX: labelX - 15 }],
    };
  });

  return (
    <Animated.Text
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          height: YEAR_ROW_HEIGHT,
          lineHeight: YEAR_ROW_HEIGHT,
          fontSize: 12,
          fontWeight: "700",
          color,
        },
        animatedStyle,
      ]}
    >
      {year}
    </Animated.Text>
  );
});

// Animated year divider
type YearDividerProps = {
  dividerX: number;
  scrollX: SharedValue<number>;
  viewportWidth: number;
  color: string;
};

const YearDivider = memo(function YearDivider({
  dividerX,
  scrollX,
  viewportWidth,
  color,
}: YearDividerProps) {
  const animatedStyle = useAnimatedStyle(() => {
    "worklet";
    const viewportStartPx = scrollX.value;
    const viewportEndPx = scrollX.value + viewportWidth;

    if (dividerX <= viewportStartPx || dividerX > viewportEndPx) {
      return { opacity: 0, transform: [{ translateX: 0 }] };
    }

    return {
      opacity: 1,
      transform: [{ translateX: dividerX - viewportStartPx }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 1,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
});

// Local zoom toggle using RNGH Pressable so it responds during scroll momentum
const ZOOM_LEVELS: ZoomLevel[] = ["years", "months", "weeks"];
const ZOOM_LABELS = {
  years: "crop_rotations.timeline.zoom_years",
  months: "crop_rotations.timeline.zoom_months",
  weeks: "crop_rotations.timeline.zoom_weeks",
} as const;

function OutdoorZoomLevelToggle({
  zoomLevel,
  onChangeZoomLevel,
}: {
  zoomLevel: ZoomLevel;
  onChangeZoomLevel: (level: ZoomLevel) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.gray4,
        borderRadius: theme.radii.l,
        padding: 2,
        alignSelf: "flex-start",
      }}
    >
      {ZOOM_LEVELS.map((key) => {
        const isActive = zoomLevel === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChangeZoomLevel(key)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: theme.radii.l - 2,
              backgroundColor: isActive ? theme.colors.primary : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isActive ? theme.colors.white : theme.colors.gray2,
              }}
            >
              {t(ZOOM_LABELS[key])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OutdoorScheduleTimeline({
  timelineData,
  onBarPress,
}: OutdoorScheduleTimelineProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("months");
  const [barVisibleRange, setBarVisibleRange] = useState({ start: 0, end: 0 });
  const hasInitialScrolled = useRef(false);

  const headerScrollRef = useAnimatedRef<Animated.ScrollView>();
  const weekHeaderScrollRef = useAnimatedRef<Animated.ScrollView>();
  const herdNamesScrollRef = useAnimatedRef<Animated.ScrollView>();
  const bodyHorizontalScrollRef = useAnimatedRef<Animated.ScrollView>();

  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const isWeeksMounted = useSharedValue(false);
  const lastRangeUpdateX = useSharedValue(0);

  const scrollAllHorizontalTo = useCallback(
    (x: number) => {
      scrollX.value = x;
      const opts = { x, y: 0, animated: false };
      (headerScrollRef.current as any)?.scrollTo?.(opts);
      (weekHeaderScrollRef.current as any)?.scrollTo?.(opts);
      (bodyHorizontalScrollRef.current as any)?.scrollTo?.(opts);
    },
    [scrollX, headerScrollRef, weekHeaderScrollRef, bodyHorizontalScrollRef],
  );

  const { totalDays, herds, epochStart } = timelineData;
  const scale =
    viewportWidth > 0 ? getScaleForZoomLevel(zoomLevel, viewportWidth) : 1;
  const contentWidth = totalDays * scale;
  const contentHeight = herds.length * ROW_HEIGHT;

  const todayDay = useMemo(() => {
    const today = new Date();
    const rawTodayDay = Math.round(
      (today.getTime() - epochStart.getTime()) / MS_PER_DAY,
    );
    return Math.max(0, Math.min(rawTodayDay, totalDays));
  }, [epochStart, totalDays]);

  // Initialize scroll centered on today
  useEffect(() => {
    if (viewportWidth > 0 && totalDays > 0 && !hasInitialScrolled.current) {
      hasInitialScrolled.current = true;
      const x = Math.max(
        0,
        Math.min(
          todayDay * scale - viewportWidth / 2,
          contentWidth - viewportWidth,
        ),
      );
      setBarVisibleRange({
        start: x / scale,
        end: (x + viewportWidth) / scale,
      });
      setTimeout(() => scrollAllHorizontalTo(x), 0);
    }
  }, [
    viewportWidth,
    totalDays,
    todayDay,
    scale,
    contentWidth,
    scrollAllHorizontalTo,
  ]);

  const allYearsWithPx = useMemo(() => {
    if (zoomLevel === "years") return [];
    return timelineData.years.map((year) => {
      const startDay = Math.round(
        (new Date(year, 0, 1).getTime() - epochStart.getTime()) / MS_PER_DAY,
      );
      const endDay = Math.round(
        (new Date(year, 11, 31).getTime() - epochStart.getTime()) / MS_PER_DAY,
      );
      return { year, startPx: startDay * scale, endPx: endDay * scale };
    });
  }, [zoomLevel, timelineData.years, epochStart, scale]);

  // Grid line caching
  const gridCache = useRef<{
    key: number;
    grids: Partial<Record<ZoomLevel, GridLine[]>>;
    weeks: GridLine[] | null;
  }>({ key: 0, grids: {}, weeks: null });

  const cacheKey = totalDays + epochStart.getTime();
  if (gridCache.current.key !== cacheKey) {
    gridCache.current = { key: cacheKey, grids: {}, weeks: null };
  }
  if (!gridCache.current.grids[zoomLevel]) {
    gridCache.current.grids[zoomLevel] = getAllGridLines(
      totalDays,
      epochStart,
      zoomLevel,
    );
  }
  const allGridLines = gridCache.current.grids[zoomLevel]!;

  if (zoomLevel === "weeks" && !gridCache.current.weeks) {
    gridCache.current.weeks = getAllWeekLines(totalDays, epochStart);
  }
  const allWeekLines = zoomLevel === "weeks" ? gridCache.current.weeks! : [];

  const rangeCenter =
    barVisibleRange.end > barVisibleRange.start
      ? (barVisibleRange.start + barVisibleRange.end) / 2
      : todayDay;
  const rangeHalfSpan =
    barVisibleRange.end > barVisibleRange.start
      ? (barVisibleRange.end - barVisibleRange.start) / 2
      : viewportWidth > 0
        ? viewportWidth / scale / 2
        : 500;

  const headerGridLines = useMemo(() => {
    if (zoomLevel !== "weeks") return allGridLines;
    const buffer = rangeHalfSpan * 20;
    return allGridLines.filter(
      (line) =>
        line.day >= rangeCenter - buffer && line.day <= rangeCenter + buffer,
    );
  }, [zoomLevel, allGridLines, rangeCenter, rangeHalfSpan]);

  const headerWeekLines = useMemo(() => {
    if (zoomLevel !== "weeks") return [];
    const buffer = rangeHalfSpan * 20;
    return allWeekLines.filter(
      (line) =>
        line.day >= rangeCenter - buffer && line.day <= rangeCenter + buffer,
    );
  }, [zoomLevel, allWeekLines, rangeCenter, rangeHalfSpan]);

  const bodyGridLines = useMemo(() => {
    const buffer = rangeHalfSpan * 5;
    return allGridLines.filter(
      (line) =>
        line.day >= rangeCenter - buffer && line.day <= rangeCenter + buffer,
    );
  }, [allGridLines, rangeCenter, rangeHalfSpan]);

  const totalHeaderHeight =
    TIMELINE_HEADER_HEIGHT +
    (zoomLevel !== "years" ? YEAR_ROW_HEIGHT : 0) +
    (zoomLevel === "weeks" ? WEEK_ROW_HEIGHT : 0);

  const updateBarRange = useCallback(
    (offsetX: number) => {
      const startDay = offsetX / scale;
      const endDay = (offsetX + viewportWidth) / scale;
      setBarVisibleRange({ start: startDay, end: endDay });
    },
    [scale, viewportWidth],
  );

  const horizontalScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
        scrollTo(headerScrollRef, event.contentOffset.x, 0, false);
        if (isWeeksMounted.value) {
          scrollTo(weekHeaderScrollRef, event.contentOffset.x, 0, false);
        }
        const dist = Math.abs(event.contentOffset.x - lastRangeUpdateX.value);
        if (dist > viewportWidth) {
          lastRangeUpdateX.value = event.contentOffset.x;
          scheduleOnRN(updateBarRange, event.contentOffset.x);
        }
      },
      onEndDrag: (event) => {
        lastRangeUpdateX.value = event.contentOffset.x;
        scheduleOnRN(updateBarRange, event.contentOffset.x);
      },
      onMomentumEnd: (event) => {
        lastRangeUpdateX.value = event.contentOffset.x;
        scheduleOnRN(updateBarRange, event.contentOffset.x);
      },
    },
    [updateBarRange, viewportWidth],
  );

  const verticalScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      scrollTo(herdNamesScrollRef, 0, event.contentOffset.y, false);
    },
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportWidth(event.nativeEvent.layout.width);
  }, []);

  const handleTodayPress = useCallback(() => {
    if (viewportWidth <= 0) return;
    const targetScrollX = Math.max(
      0,
      Math.min(
        todayDay * scale - viewportWidth / 2,
        contentWidth - viewportWidth,
      ),
    );
    setBarVisibleRange({
      start: targetScrollX / scale,
      end: (targetScrollX + viewportWidth) / scale,
    });
    scrollAllHorizontalTo(targetScrollX);
  }, [viewportWidth, todayDay, scale, contentWidth, scrollAllHorizontalTo]);

  const handleZoomLevelChange = useCallback(
    (level: ZoomLevel) => {
      // Keep the current center day in view when changing zoom
      const oldScale = getScaleForZoomLevel(zoomLevel, viewportWidth);
      const centerDay = (scrollX.value + viewportWidth / 2) / oldScale;
      setZoomLevel(level);
      const newScale = getScaleForZoomLevel(level, viewportWidth);
      const x = Math.max(
        0,
        Math.min(
          centerDay * newScale - viewportWidth / 2,
          totalDays * newScale - viewportWidth,
        ),
      );
      setBarVisibleRange({
        start: x / newScale,
        end: (x + viewportWidth) / newScale,
      });
      isWeeksMounted.value = level === "weeks";
      setTimeout(() => scrollAllHorizontalTo(x), 0);
    },
    [
      viewportWidth,
      totalDays,
      zoomLevel,
      scrollX,
      scrollAllHorizontalTo,
      isWeeksMounted,
    ],
  );

  const renderHerdRow = useCallback(
    ({ item }: { item: OutdoorHerdData }) => (
      <OutdoorTimelineHerdRow
        bars={item.bars}
        scale={scale}
        visibleStartDay={barVisibleRange.start}
        visibleEndDay={barVisibleRange.end}
        onBarPress={onBarPress}
      />
    ),
    [scale, barVisibleRange.start, barVisibleRange.end, onBarPress],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ROW_HEIGHT,
      offset: ROW_HEIGHT * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item: OutdoorHerdData) => item.herdId, []);

  if (totalDays === 0 || herds.length === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Zoom level toggle and Today button */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: theme.spacing.s,
          gap: theme.spacing.s,
        }}
      >
        <OutdoorZoomLevelToggle
          zoomLevel={zoomLevel}
          onChangeZoomLevel={handleZoomLevelChange}
        />
        <Pressable
          onPress={handleTodayPress}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: theme.colors.gray4,
            borderRadius: theme.radii.l,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: theme.colors.gray1,
            }}
          >
            {t("crop_rotations.timeline.today")}
          </Text>
        </Pressable>
      </View>

      {/* Timeline grid */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.white,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <View style={{ flexDirection: "row", flex: 1 }}>
          {/* Left column: herd names */}
          <View style={{ width: LABEL_WIDTH }}>
            <View
              style={{
                height: totalHeaderHeight,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.gray4,
                justifyContent: "flex-end",
                paddingHorizontal: 6,
                paddingBottom: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: theme.colors.gray2,
                }}
              >
                {t("animals.herd")}
              </Text>
            </View>
            <Animated.ScrollView
              ref={herdNamesScrollRef}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            >
              {herds.map((herd) => (
                <View
                  key={herd.herdId}
                  style={{
                    height: ROW_HEIGHT,
                    justifyContent: "center",
                    paddingHorizontal: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.gray4,
                    borderRightWidth: 1,
                    borderRightColor: theme.colors.gray4,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: theme.colors.gray1,
                    }}
                  >
                    {herd.herdName}
                  </Text>
                </View>
              ))}
            </Animated.ScrollView>
          </View>

          {/* Right area: scrollable timeline */}
          <View style={{ flex: 1 }} onLayout={handleLayout}>
            {viewportWidth > 0 && (
              <>
                {/* Year context row */}
                {zoomLevel !== "years" && (
                  <View
                    style={{
                      height: YEAR_ROW_HEIGHT,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {allYearsWithPx.map(({ year, startPx }) => (
                      <YearDivider
                        key={`divider-${year}`}
                        dividerX={startPx}
                        scrollX={scrollX}
                        viewportWidth={viewportWidth}
                        color={theme.colors.gray2}
                      />
                    ))}
                    {allYearsWithPx.map(({ year, startPx, endPx }) => (
                      <StickyYearLabel
                        key={year}
                        year={year}
                        yearStartPx={startPx}
                        yearEndPx={endPx}
                        scrollX={scrollX}
                        viewportWidth={viewportWidth}
                        color={theme.colors.gray1}
                      />
                    ))}
                  </View>
                )}

                {/* Header row */}
                <View style={{ height: TIMELINE_HEADER_HEIGHT }}>
                  <Animated.ScrollView
                    ref={headerScrollRef}
                    horizontal
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    style={{
                      borderBottomWidth: zoomLevel === "weeks" ? 0 : 1,
                      borderBottomColor: theme.colors.gray4,
                    }}
                  >
                    <TimelineHeader
                      gridLines={headerGridLines}
                      scale={scale}
                      contentWidth={contentWidth}
                    />
                  </Animated.ScrollView>
                </View>

                {/* Week number row */}
                {zoomLevel === "weeks" && (
                  <View style={{ height: WEEK_ROW_HEIGHT }}>
                    <Animated.ScrollView
                      ref={weekHeaderScrollRef}
                      horizontal
                      scrollEnabled={false}
                      showsHorizontalScrollIndicator={false}
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.gray4,
                      }}
                    >
                      <View
                        style={{
                          width: contentWidth,
                          height: WEEK_ROW_HEIGHT,
                          position: "relative",
                        }}
                      >
                        {headerWeekLines.map((line) => (
                          <View
                            key={line.day}
                            style={{
                              position: "absolute",
                              left: line.day * scale,
                              top: 0,
                              bottom: 0,
                            }}
                          >
                            <View
                              style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 1,
                                backgroundColor: theme.colors.gray3,
                              }}
                            />
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: "500",
                                color: theme.colors.gray2,
                                position: "absolute",
                                left: 4,
                                top: 3,
                              }}
                              numberOfLines={1}
                            >
                              {line.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </Animated.ScrollView>
                  </View>
                )}

                {/* Body */}
                <Animated.ScrollView
                  ref={bodyHorizontalScrollRef}
                  horizontal
                  onScroll={horizontalScrollHandler}
                  scrollEventThrottle={16}
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={{ width: contentWidth }}>
                    {/* Grid lines layer */}
                    <View
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: contentHeight,
                      }}
                    >
                      {bodyGridLines.map((line) => {
                        const isWeeksView = zoomLevel === "weeks";
                        const lineColor = line.isMajor
                          ? theme.colors.gray3
                          : isWeeksView
                            ? theme.colors.gray3
                            : theme.colors.gray4;
                        return (
                          <View
                            key={line.day}
                            style={{
                              position: "absolute",
                              left: line.day * scale,
                              top: 0,
                              bottom: 0,
                              width: 1,
                              backgroundColor: lineColor,
                            }}
                          />
                        );
                      })}
                    </View>

                    {/* Rows */}
                    <Animated.FlatList
                      data={herds}
                      renderItem={renderHerdRow}
                      keyExtractor={keyExtractor}
                      getItemLayout={getItemLayout}
                      initialNumToRender={20}
                      windowSize={5}
                      onScroll={verticalScrollHandler}
                      scrollEventThrottle={16}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                    />
                  </View>
                </Animated.ScrollView>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
