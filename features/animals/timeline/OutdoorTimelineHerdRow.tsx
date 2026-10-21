import { useMemo, memo, useCallback } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { OutdoorTimelineBar } from "./OutdoorTimelineBar";
import { OutdoorBar } from "./outdoor-timeline-utils";

type OutdoorTimelineHerdRowProps = {
  bars: OutdoorBar[];
  laneCount: number;
  scale: number;
  visibleStartDay: number;
  visibleEndDay: number;
  todayDay: number;
  onBarPress: (scheduleId: string) => void;
};

const ROW_HEIGHT = 46;
// Height of one sub-line when a row is split into several lanes
const LANE_HEIGHT = 30;
const LANE_BAR_INSET = 3;

// Rows with overlapping bars grow by one lane per extra overlap
function getRowHeight(laneCount: number): number {
  return laneCount > 1 ? laneCount * LANE_HEIGHT : ROW_HEIGHT;
}

export const OutdoorTimelineHerdRow = memo(function OutdoorTimelineHerdRow({
  bars,
  laneCount,
  scale,
  visibleStartDay,
  visibleEndDay,
  todayDay,
  onBarPress,
}: OutdoorTimelineHerdRowProps) {
  const theme = useTheme();

  // Today's absolute pixel position within the timeline content
  const todayLeft = todayDay * scale;

  // Cull bars to visible range with large padding for smoother scrolling
  const visibleBars = useMemo(() => {
    const padding = (visibleEndDay - visibleStartDay) * 3;
    return bars.filter(
      (bar) =>
        bar.endDay > visibleStartDay - padding &&
        bar.startDay < visibleEndDay + padding,
    );
  }, [bars, visibleStartDay, visibleEndDay]);

  const handleBarPress = useCallback(
    (scheduleId: string) => {
      onBarPress(scheduleId);
    },
    [onBarPress],
  );

  return (
    <View
      style={{
        height: getRowHeight(laneCount),
        position: "relative",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray4,
      }}
    >
      {/* Faint divider between lanes */}
      {Array.from({ length: laneCount - 1 }, (_, index) => (
        <View
          key={`lane-divider-${index}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (index + 1) * LANE_HEIGHT,
            height: 1,
            backgroundColor: theme.colors.gray5,
          }}
        />
      ))}
      {visibleBars.map((bar, index) => (
        <OutdoorTimelineBar
          key={`${bar.scheduleId}-${index}`}
          bar={bar}
          left={bar.startDay * scale}
          width={(bar.endDay - bar.startDay) * scale}
          todayLeft={todayLeft}
          onPress={handleBarPress}
          {...(laneCount > 1
            ? {
                top: (bar.lane ?? 0) * LANE_HEIGHT + LANE_BAR_INSET,
                height: LANE_HEIGHT - LANE_BAR_INSET * 2,
              }
            : {})}
        />
      ))}
    </View>
  );
});

export { ROW_HEIGHT, getRowHeight };
