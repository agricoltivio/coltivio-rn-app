import { useMemo, memo, useCallback } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { OutdoorTimelineBar } from "./OutdoorTimelineBar";
import { OutdoorBar } from "./outdoor-timeline-utils";

type OutdoorTimelineHerdRowProps = {
  bars: OutdoorBar[];
  scale: number;
  visibleStartDay: number;
  visibleEndDay: number;
  todayDay: number;
  onBarPress: (scheduleId: string) => void;
};

const ROW_HEIGHT = 46;

export const OutdoorTimelineHerdRow = memo(function OutdoorTimelineHerdRow({
  bars,
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
        height: ROW_HEIGHT,
        position: "relative",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray4,
      }}
    >
      {visibleBars.map((bar, index) => (
        <OutdoorTimelineBar
          key={`${bar.scheduleId}-${index}`}
          bar={bar}
          left={bar.startDay * scale}
          width={(bar.endDay - bar.startDay) * scale}
          todayLeft={todayLeft}
          onPress={handleBarPress}
        />
      ))}
    </View>
  );
});

export { ROW_HEIGHT };
