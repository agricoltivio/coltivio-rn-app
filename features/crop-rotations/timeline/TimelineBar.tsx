import { memo } from "react";
import { stringToColor, hexToRgba } from "@/theme/theme";
import { Text, TouchableOpacity, View } from "react-native";
import { TimelineBar as TimelineBarData } from "./timeline-utils";

type TimelineBarProps = {
  bar: TimelineBarData;
  left: number;
  width: number;
  onPress: (rotationId: string, plotName: string) => void;
};

const MIN_BAR_WIDTH = 4;

export const TimelineBar = memo(function TimelineBar({
  bar,
  left,
  width,
  onPress,
}: TimelineBarProps) {
  const barWidth = Math.max(width, MIN_BAR_WIDTH);
  const color = stringToColor(bar.cropName);
  const showLabel = barWidth > 50;

  return (
    <TouchableOpacity
      onPress={() => onPress(bar.rotationId, bar.plotName)}
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
});
