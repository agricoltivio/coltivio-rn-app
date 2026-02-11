import { memo } from "react";
import { stringToColor, hexToRgba } from "@/theme/theme";
import { Text, TouchableOpacity, View } from "react-native";
import { OutdoorBar } from "./outdoor-timeline-utils";

type OutdoorTimelineBarProps = {
  bar: OutdoorBar;
  left: number;
  width: number;
  onPress: (scheduleId: string) => void;
};

const MIN_BAR_WIDTH = 4;

export const OutdoorTimelineBar = memo(function OutdoorTimelineBar({
  bar,
  left,
  width,
  onPress,
}: OutdoorTimelineBarProps) {
  const barWidth = Math.max(width, MIN_BAR_WIDTH);
  const color = stringToColor(bar.herdName);
  const showLabel = barWidth > 50;
  const bgColor = hexToRgba(color, 0.75);

  return (
    <TouchableOpacity
      onPress={() => onPress(bar.scheduleId)}
      activeOpacity={0.7}
      style={{
        position: "absolute",
        left,
        width: barWidth,
        top: 4,
        bottom: 4,
        backgroundColor: bgColor,
        borderRadius: 4,
        justifyContent: "center",
        paddingHorizontal: 4,
        overflow: "hidden",
      }}
    >
      {showLabel && bar.notes && (
        <Text
          numberOfLines={1}
          style={{
            color: "#ffffff",
            fontSize: 11,
            fontWeight: "600",
          }}
        >
          {bar.notes}
        </Text>
      )}
      {/* Semi-transparent overlay on right edge for open-ended schedules */}
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
