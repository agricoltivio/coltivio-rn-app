import { useMemo, memo, useCallback } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { TimelineBar } from "./TimelineBar";
import { TimelineBar as TimelineBarData } from "./timeline-utils";

type TimelinePlotRowProps = {
  bars: TimelineBarData[];
  scale: number;
  visibleStartDay: number;
  visibleEndDay: number;
  onBarPress: (rotationId: string, plotName: string) => void;
};

const ROW_HEIGHT = 46;

export const TimelinePlotRow = memo(function TimelinePlotRow({
  bars,
  scale,
  visibleStartDay,
  visibleEndDay,
  onBarPress,
}: TimelinePlotRowProps) {
  const theme = useTheme();

  // Cull bars to visible range with large padding for smoother scrolling
  const visibleBars = useMemo(() => {
    const padding = (visibleEndDay - visibleStartDay) * 3;
    return bars.filter((bar) => {
      return (
        bar.endDay > visibleStartDay - padding &&
        bar.startDay < visibleEndDay + padding
      );
    });
  }, [bars, visibleStartDay, visibleEndDay]);

  const handleBarPress = useCallback(
    (rotationId: string, plotName: string) => {
      onBarPress(rotationId, plotName);
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
        <TimelineBar
          key={`${bar.rotationId}-${index}`}
          bar={bar}
          left={bar.startDay * scale}
          width={(bar.endDay - bar.startDay) * scale}
          onPress={handleBarPress}
        />
      ))}
    </View>
  );
});

export { ROW_HEIGHT };
