import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { TimelineBar } from "./TimelineBar";
import { TimelineBar as TimelineBarData } from "./timeline-utils";

type TimelinePlotRowProps = {
  bars: TimelineBarData[];
  totalGridWidth: number;
  monthWidth: number;
  onBarPress: (rotationId: string, plotName: string) => void;
};

const ROW_HEIGHT = 36;

export function TimelinePlotRow({
  bars,
  totalGridWidth,
  monthWidth,
  onBarPress,
}: TimelinePlotRowProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        height: ROW_HEIGHT,
        width: totalGridWidth,
        position: "relative",
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray4,
      }}
    >
      {/* Vertical month grid lines */}
      {Array.from({ length: 11 }, (_, monthIndex) => (
        <View
          key={monthIndex}
          style={{
            position: "absolute",
            left: (monthIndex + 1) * monthWidth,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: theme.colors.gray4,
          }}
        />
      ))}
      {/* Bars */}
      {bars.map((bar) => (
        <TimelineBar
          key={bar.rotationId}
          bar={bar}
          totalGridWidth={totalGridWidth}
          onPress={() => onBarPress(bar.rotationId, bar.plotName)}
        />
      ))}
    </View>
  );
}

export { ROW_HEIGHT };
