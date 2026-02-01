import { stringToColor, hexToRgba } from "@/theme/theme";
import { Text, TouchableOpacity, View } from "react-native";
import { TimelineBar as TimelineBarData } from "./timeline-utils";

type TimelineBarProps = {
  bar: TimelineBarData;
  totalGridWidth: number;
  onPress: () => void;
};

const MIN_BAR_WIDTH = 4;

export function TimelineBar({ bar, totalGridWidth, onPress }: TimelineBarProps) {
  const left = bar.startFraction * totalGridWidth;
  const rawWidth = (bar.endFraction - bar.startFraction) * totalGridWidth;
  const barWidth = Math.max(rawWidth, MIN_BAR_WIDTH);
  const color = stringToColor(bar.cropName);
  const showLabel = barWidth > 50;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        position: "absolute",
        left,
        width: barWidth,
        top: 4,
        bottom: 4,
        backgroundColor: color,
        borderRadius: 4,
        justifyContent: "center",
        paddingHorizontal: 4,
        overflow: "hidden",
      }}
    >
      {showLabel && (
        <Text
          numberOfLines={1}
          style={{
            color: "#ffffff",
            fontSize: 11,
            fontWeight: "600",
          }}
        >
          {bar.cropName}
        </Text>
      )}
      {/* Semi-transparent overlay on right edge for open-ended rotations */}
      {bar.isOpenEnded && (
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: Math.min(20, barWidth * 0.3),
            backgroundColor: hexToRgba("#ffffff", 0.35),
          }}
        />
      )}
    </TouchableOpacity>
  );
}
