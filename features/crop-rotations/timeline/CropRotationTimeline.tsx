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
import { TimelineData, getGridLines, getWeekLines } from "./timeline-utils";
import { TimelinePlotRow, ROW_HEIGHT } from "./TimelinePlotRow";
import { TimelineHeader, TIMELINE_HEADER_HEIGHT } from "./TimelineHeader";
import {
  ZoomLevel,
  ZoomLevelToggle,
  getScaleForZoomLevel,
} from "./ZoomLevelToggle";
import { runOnJS } from "react-native-worklets";

type CropRotationTimelineProps = {
  timelineData: TimelineData;
  onBarPress: (rotationId: string, plotName: string) => void;
};

const PLOT_LABEL_WIDTH = 100;
const MS_PER_DAY = 86_400_000;
// Debounce delay for grid line updates (ms)
const GRID_UPDATE_DELAY = 100;
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
  // Header visible range - updated during scroll for real-time header
  const [headerRange, setHeaderRange] = useState({ start: 0, end: 0 });
  // Body grid lines range - updated on scroll end (debounced) for performance
  const [bodyGridRange, setBodyGridRange] = useState({ start: 0, end: 0 });
  // Track if initial scroll has been done
  const hasInitialScrolled = useRef(false);

  // Animated refs for worklet-based scroll sync (UI thread)
  const headerScrollRef = useAnimatedRef<Animated.ScrollView>();
  const weekHeaderScrollRef = useAnimatedRef<Animated.ScrollView>();
  const plotNamesScrollRef = useAnimatedRef<Animated.ScrollView>();
  const bodyHorizontalScrollRef = useAnimatedRef<Animated.ScrollView>();
  const bodyVerticalScrollRef = useAnimatedRef<Animated.ScrollView>();

  // Shared values for scroll position (no re-renders)
  const scrollX = useSharedValue(0);
  const scrollY = useSharedValue(0);

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

  // Debounce timer ref for body grid lines
  const gridUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Throttle ref for header updates
  const lastHeaderUpdate = useRef(0);

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

  // Calculate initial scroll position centered on today
  const initialScrollX = useMemo(() => {
    if (viewportWidth <= 0) return 0;
    const newContentWidth = totalDays * scale;
    return Math.max(
      0,
      Math.min(
        todayDay * scale - viewportWidth / 2,
        newContentWidth - viewportWidth,
      ),
    );
  }, [viewportWidth, totalDays, scale, todayDay]);

  // Initialize ranges and scroll position when viewport becomes available
  useEffect(() => {
    if (viewportWidth > 0 && totalDays > 0 && !hasInitialScrolled.current) {
      hasInitialScrolled.current = true;
      const startDay = initialScrollX / scale;
      const endDay = (initialScrollX + viewportWidth) / scale;
      setHeaderRange({ start: startDay, end: endDay });
      setBodyGridRange({ start: startDay, end: endDay });
      // Use setTimeout to ensure ScrollViews are mounted after this render
      setTimeout(() => scrollAllHorizontalTo(initialScrollX), 0);
    }
  }, [viewportWidth, totalDays, initialScrollX, scale, scrollAllHorizontalTo]);

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

  // Header grid lines - updated during scroll for real-time visibility
  // Use initialScrollX-based range when headerRange hasn't been set yet
  const headerGridLines = useMemo(() => {
    const hasInitialRange = headerRange.end > headerRange.start;
    const startDay = hasInitialRange
      ? headerRange.start
      : initialScrollX / scale;
    const endDay = hasInitialRange
      ? headerRange.end
      : (initialScrollX + viewportWidth) / scale;
    const span = endDay - startDay;
    const padding = Math.max(span, 30);
    return getGridLines(startDay - padding, endDay + padding, epochStart);
  }, [
    headerRange.start,
    headerRange.end,
    initialScrollX,
    viewportWidth,
    scale,
    epochStart,
  ]);

  // Body grid lines - only recalculated when scroll ends (debounced)
  // Use initialScrollX-based range when bodyGridRange hasn't been set yet
  const bodyGridLines = useMemo(() => {
    const hasInitialRange = bodyGridRange.end > bodyGridRange.start;
    const startDay = hasInitialRange
      ? bodyGridRange.start
      : initialScrollX / scale;
    const endDay = hasInitialRange
      ? bodyGridRange.end
      : (initialScrollX + viewportWidth) / scale;
    const span = endDay - startDay;
    const padding = Math.max(span, 30);
    return getGridLines(startDay - padding, endDay + padding, epochStart);
  }, [
    bodyGridRange.start,
    bodyGridRange.end,
    initialScrollX,
    viewportWidth,
    scale,
    epochStart,
  ]);

  // Week number lines - for the week header row in weeks view
  const weekLines = useMemo(() => {
    if (zoomLevel !== "weeks") return [];
    const hasInitialRange = headerRange.end > headerRange.start;
    const startDay = hasInitialRange
      ? headerRange.start
      : initialScrollX / scale;
    const endDay = hasInitialRange
      ? headerRange.end
      : (initialScrollX + viewportWidth) / scale;
    const span = endDay - startDay;
    const padding = Math.max(span, 30);
    return getWeekLines(startDay - padding, endDay + padding, epochStart);
  }, [
    zoomLevel,
    headerRange.start,
    headerRange.end,
    initialScrollX,
    viewportWidth,
    scale,
    epochStart,
  ]);

  // Calculate total header height based on zoom level
  const totalHeaderHeight =
    TIMELINE_HEADER_HEIGHT +
    (zoomLevel !== "years" ? YEAR_ROW_HEIGHT : 0) +
    (zoomLevel === "weeks" ? WEEK_ROW_HEIGHT : 0);

  // Throttled update of header range (called during scroll, ~15fps to reduce re-renders)
  const updateHeaderRange = useCallback(
    (offsetX: number) => {
      const now = Date.now();
      if (now - lastHeaderUpdate.current < 66) return; // ~15fps throttle for smoother animation
      lastHeaderUpdate.current = now;
      const startDay = offsetX / scale;
      const endDay = (offsetX + viewportWidth) / scale;
      setHeaderRange({ start: startDay, end: endDay });
    },
    [scale, viewportWidth],
  );

  // Debounced update of body grid range (called on scroll end)
  const updateBodyGridRange = useCallback(
    (offsetX: number) => {
      if (gridUpdateTimer.current) {
        clearTimeout(gridUpdateTimer.current);
      }
      gridUpdateTimer.current = setTimeout(() => {
        const startDay = offsetX / scale;
        const endDay = (offsetX + viewportWidth) / scale;
        setBodyGridRange({ start: startDay, end: endDay });
      }, GRID_UPDATE_DELAY);
    },
    [scale, viewportWidth],
  );

  // Native-driven horizontal scroll handler - syncs header
  const horizontalScrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      // Sync header scrolls on UI thread
      scrollTo(headerScrollRef, event.contentOffset.x, 0, false);
      scrollTo(weekHeaderScrollRef, event.contentOffset.x, 0, false);
      // Update header labels during scroll (throttled on JS side)
      runOnJS(updateHeaderRange)(event.contentOffset.x);
    },
    onEndDrag: (event) => {
      runOnJS(updateHeaderRange)(event.contentOffset.x);
      runOnJS(updateBodyGridRange)(event.contentOffset.x);
    },
    onMomentumEnd: (event) => {
      runOnJS(updateHeaderRange)(event.contentOffset.x);
      runOnJS(updateBodyGridRange)(event.contentOffset.x);
    },
  });

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
    const startDay = targetScrollX / scale;
    const endDay = (targetScrollX + viewportWidth) / scale;
    setHeaderRange({ start: startDay, end: endDay });
    setBodyGridRange({ start: startDay, end: endDay });
    scrollAllHorizontalTo(targetScrollX);
  }, [viewportWidth, todayDay, scale, contentWidth, scrollAllHorizontalTo]);

  // When zoom level changes, scroll to center on current year
  const handleZoomLevelChange = useCallback(
    (level: ZoomLevel) => {
      setZoomLevel(level);
      if (viewportWidth > 0) {
        const newScale = getScaleForZoomLevel(level, viewportWidth);
        const newContentWidth = totalDays * newScale;
        const targetScrollX = Math.max(
          0,
          Math.min(
            todayDay * newScale - viewportWidth / 2,
            newContentWidth - viewportWidth,
          ),
        );
        const startDay = targetScrollX / newScale;
        const endDay = (targetScrollX + viewportWidth) / newScale;
        setHeaderRange({ start: startDay, end: endDay });
        setBodyGridRange({ start: startDay, end: endDay });
        // Scroll after React re-renders with new scale
        setTimeout(() => scrollAllHorizontalTo(targetScrollX), 0);
      }
    },
    [viewportWidth, totalDays, todayDay, scrollAllHorizontalTo],
  );

  // Visible range for bar culling - use headerRange (updates during scroll) for real-time bar visibility
  const visibleStartDay =
    headerRange.end > headerRange.start
      ? headerRange.start
      : initialScrollX / scale;
  const visibleEndDay =
    headerRange.end > headerRange.start
      ? headerRange.end
      : (initialScrollX + viewportWidth) / scale;

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
                        {weekLines.map((line) => (
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
                        // In weeks view, make all week lines more visible
                        const isWeeksView = zoomLevel === "weeks";
                        const lineColor = line.isMajor
                          ? theme.colors.gray3
                          : isWeeksView
                            ? theme.colors.gray3 // More visible in weeks view
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
                    <Animated.ScrollView
                      ref={bodyVerticalScrollRef}
                      onScroll={verticalScrollHandler}
                      scrollEventThrottle={16}
                      showsVerticalScrollIndicator={false}
                    >
                      {plots.map((plot) => (
                        <TimelinePlotRow
                          key={plot.plotId}
                          bars={plot.bars}
                          scale={scale}
                          visibleStartDay={visibleStartDay}
                          visibleEndDay={visibleEndDay}
                          onBarPress={onBarPress}
                        />
                      ))}
                    </Animated.ScrollView>
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
