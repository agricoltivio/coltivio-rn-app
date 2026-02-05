import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { View, Text, LayoutChangeEvent, Pressable } from "react-native";
import { useTheme } from "styled-components/native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  scrollTo,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import {
  TimelineData,
  TimelinePlotData,
  GridLine,
  getAllGridLines,
  getAllWeekLines,
} from "./timeline-utils";
import { TimelinePlotRow, ROW_HEIGHT } from "./TimelinePlotRow";
import { TimelineHeader, TIMELINE_HEADER_HEIGHT } from "./TimelineHeader";
import {
  ZoomLevel,
  ZoomLevelToggle,
  getScaleForZoomLevel,
} from "./ZoomLevelToggle";
import { scheduleOnRN } from "react-native-worklets";

type CropRotationTimelineProps = {
  timelineData: TimelineData;
  onBarPress: (rotationId: string, plotName: string) => void;
};

const PLOT_LABEL_WIDTH = 100;
const MS_PER_DAY = 86_400_000;
// Height of the year context row (shown in months/weeks views)
const YEAR_ROW_HEIGHT = 20;
// Height of the week number row (shown in weeks view)
const WEEK_ROW_HEIGHT = 20;

// Animated sticky year label - positions itself smoothly on UI thread
type StickyYearLabelProps = {
  year: number;
  yearStartPx: number;
  yearEndPx: number;
  scrollX: SharedValue<number>;
  viewportWidth: number;
  color: string;
};

// Labels are rendered OUTSIDE the ScrollView, so positions are viewport-relative
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

    // Centered in the visible portion, converted to viewport-relative coords
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

// Dividers rendered OUTSIDE the ScrollView, viewport-relative
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

export function CropRotationTimeline({
  timelineData,
  onBarPress,
}: CropRotationTimelineProps) {
  const theme = useTheme();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("years");
  // Bar culling range — updated on mount, zoom change, and scroll end
  const [barVisibleRange, setBarVisibleRange] = useState({ start: 0, end: 0 });
  const hasInitialScrolled = useRef(false);

  // Animated refs for worklet-based scroll sync (UI thread)
  const headerScrollRef = useAnimatedRef<Animated.ScrollView>();
  const weekHeaderScrollRef = useAnimatedRef<Animated.ScrollView>();
  const plotNamesScrollRef = useAnimatedRef<Animated.ScrollView>();
  const bodyHorizontalScrollRef = useAnimatedRef<Animated.ScrollView>();

  // Shared values for scroll position (no re-renders)
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);
  // Track whether weeks mode is active (guard weekHeaderScrollRef scrollTo in worklet)
  const isWeeksMounted = useSharedValue(false);
  // Track scroll position at last range update (for distance-based refresh during momentum)
  const lastRangeUpdateX = useSharedValue(0);

  // Programmatic scroll helper - uses native .scrollTo() via animated ref .current
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

  const { totalDays, plots, epochStart } = timelineData;
  const scale =
    viewportWidth > 0 ? getScaleForZoomLevel(zoomLevel, viewportWidth) : 1;
  const contentWidth = totalDays * scale;
  const contentHeight = plots.length * ROW_HEIGHT;

  // Today's day offset from epoch start
  const todayDay = useMemo(() => {
    const today = new Date();
    const rawTodayDay = Math.round(
      (today.getTime() - epochStart.getTime()) / MS_PER_DAY,
    );
    return Math.max(0, Math.min(rawTodayDay, totalDays));
  }, [epochStart, totalDays]);

  // Initialize scroll position centered on today
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
      setBarVisibleRange({ start: x / scale, end: (x + viewportWidth) / scale });
      setTimeout(() => scrollAllHorizontalTo(x), 0);
    }
  }, [viewportWidth, totalDays, todayDay, scale, contentWidth, scrollAllHorizontalTo]);

  // Get all years in the timeline data for the animated year row (pre-compute pixel positions)
  const allYearsWithPx = useMemo(() => {
    if (zoomLevel === "years") return [];
    return timelineData.years.map((year) => {
      const startDay = Math.round(
        (new Date(year, 0, 1).getTime() - epochStart.getTime()) / MS_PER_DAY,
      );
      const endDay = Math.round(
        (new Date(year, 11, 31).getTime() - epochStart.getTime()) / MS_PER_DAY,
      );
      return {
        year,
        startPx: startDay * scale,
        endPx: endDay * scale,
      };
    });
  }, [zoomLevel, timelineData.years, epochStart, scale]);

  // Lazy cache: grid lines computed once per zoom level on first use, instant on re-toggle.
  // Invalidated when timeline data changes (totalDays/epochStart).
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
    gridCache.current.grids[zoomLevel] = getAllGridLines(totalDays, epochStart, zoomLevel);
  }
  const allGridLines = gridCache.current.grids[zoomLevel]!;

  if (zoomLevel === "weeks" && !gridCache.current.weeks) {
    gridCache.current.weeks = getAllWeekLines(totalDays, epochStart);
  }
  const allWeekLines = zoomLevel === "weeks" ? gridCache.current.weeks! : [];

  // Helper: compute center/halfSpan from barVisibleRange or fallback to todayDay
  const rangeCenter = barVisibleRange.end > barVisibleRange.start
    ? (barVisibleRange.start + barVisibleRange.end) / 2
    : todayDay;
  const rangeHalfSpan = barVisibleRange.end > barVisibleRange.start
    ? (barVisibleRange.end - barVisibleRange.start) / 2
    : (viewportWidth > 0 ? viewportWidth / scale / 2 : 500);

  // Header grid lines — large buffer so labels are visible during fast scrolling.
  // Years/months have few lines total so render all; weeks gets 10-viewport buffer (~50 elements).
  const headerGridLines = useMemo(() => {
    if (zoomLevel !== "weeks") return allGridLines;
    const buffer = rangeHalfSpan * 20;
    return allGridLines.filter(
      (line) => line.day >= rangeCenter - buffer && line.day <= rangeCenter + buffer,
    );
  }, [zoomLevel, allGridLines, rangeCenter, rangeHalfSpan]);

  // Header week lines — same large buffer, only in weeks view
  const headerWeekLines = useMemo(() => {
    if (zoomLevel !== "weeks") return [];
    const buffer = rangeHalfSpan * 20;
    return allWeekLines.filter(
      (line) => line.day >= rangeCenter - buffer && line.day <= rangeCenter + buffer,
    );
  }, [zoomLevel, allWeekLines, rangeCenter, rangeHalfSpan]);

  // Body grid lines — smaller buffer, updates lazily (grid lines can pop in)
  const bodyGridLines = useMemo(() => {
    const buffer = rangeHalfSpan * 5;
    return allGridLines.filter(
      (line) => line.day >= rangeCenter - buffer && line.day <= rangeCenter + buffer,
    );
  }, [allGridLines, rangeCenter, rangeHalfSpan]);

  // Calculate total header height based on zoom level
  const totalHeaderHeight =
    TIMELINE_HEADER_HEIGHT +
    (zoomLevel !== "years" ? YEAR_ROW_HEIGHT : 0) +
    (zoomLevel === "weeks" ? WEEK_ROW_HEIGHT : 0);

  // Update bar visible range (called on scroll end and programmatic navigation)
  const updateBarRange = useCallback(
    (offsetX: number) => {
      const startDay = offsetX / scale;
      const endDay = (offsetX + viewportWidth) / scale;
      setBarVisibleRange({ start: startDay, end: endDay });
    },
    [scale, viewportWidth],
  );

  // Native-driven horizontal scroll handler — syncs header on UI thread,
  // updates bar/grid range on scroll end and during long momentum scrolls
  const horizontalScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollX.value = event.contentOffset.x;
        scrollTo(headerScrollRef, event.contentOffset.x, 0, false);
        if (isWeeksMounted.value) {
          scrollTo(weekHeaderScrollRef, event.contentOffset.x, 0, false);
        }
        // Refresh ranges if scrolled far from last update (covers long momentum scrolls)
        const dist = Math.abs(event.contentOffset.x - lastRangeUpdateX.value);
        if (dist > viewportWidth * 2) {
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

  // Native-driven vertical scroll handler - syncs plot names
  const verticalScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      // Sync plot names scroll on UI thread
      scrollTo(plotNamesScrollRef, 0, event.contentOffset.y, false);
    },
  });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportWidth(event.nativeEvent.layout.width);
  }, []);

  // Jump to today's date
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

  // When zoom level changes, re-center on today
  const handleZoomLevelChange = useCallback(
    (level: ZoomLevel) => {
      setZoomLevel(level);
      const newScale = getScaleForZoomLevel(level, viewportWidth);
      const x = Math.max(
        0,
        Math.min(
          todayDay * newScale - viewportWidth / 2,
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
    [viewportWidth, totalDays, todayDay, scrollAllHorizontalTo, isWeeksMounted],
  );

  // FlatList helpers
  const renderPlotRow = useCallback(
    ({ item }: { item: TimelinePlotData }) => (
      <TimelinePlotRow
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

  const keyExtractor = useCallback(
    (item: TimelinePlotData) => item.plotId,
    [],
  );

  if (totalDays === 0 || plots.length === 0) {
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
        <ZoomLevelToggle
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
            Today
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
          {/* Left column: plot names */}
          <View style={{ width: PLOT_LABEL_WIDTH }}>
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
                Plot
              </Text>
            </View>
            {/* Plot names - synced with body vertical scroll */}
            <Animated.ScrollView
              ref={plotNamesScrollRef}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            >
              {plots.map((plot) => (
                <View
                  key={plot.plotId}
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
                    {plot.plotName}
                  </Text>
                </View>
              ))}
            </Animated.ScrollView>
          </View>

          {/* Right area: scrollable timeline */}
          <View
            style={{
              flex: 1,
            }}
            onLayout={handleLayout}
          >
            {viewportWidth > 0 && (
              <>
                {/* Year context row - non-scrolling overlay, positioned by animated styles */}
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

                {/* Header row — months/years labels, horizontal scroll synced with body */}
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

                {/* Week number row — only in weeks view */}
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

                {/* Body — horizontal scroll wrapping vertical FlatList */}
                <Animated.ScrollView
                  ref={bodyHorizontalScrollRef}
                  horizontal
                  onScroll={horizontalScrollHandler}
                  scrollEventThrottle={16}
                  showsHorizontalScrollIndicator={false}
                >
                  <View
                    style={{
                      width: contentWidth,
                    }}
                  >
                    {/* Grid lines layer - single render for all rows */}
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
                      data={plots}
                      renderItem={renderPlotRow}
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
