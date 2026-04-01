import { memo } from "react";
import { stringToColor, hexToRgba } from "@/theme/theme";
import { Text, TouchableOpacity, View } from "react-native";
import { OutdoorBar } from "./outdoor-timeline-utils";

type OutdoorTimelineBarProps = {
  bar: OutdoorBar;
  left: number;
  width: number;
  todayLeft: number;
  onPress: (scheduleId: string) => void;
};

const MIN_BAR_WIDTH = 4;

export const OutdoorTimelineBar = memo(function OutdoorTimelineBar({
  bar,
  left,
  width,
  todayLeft,
  onPress,
}: OutdoorTimelineBarProps) {
  const barWidth = Math.max(width, MIN_BAR_WIDTH);
  // Use fixed colors for schedule types (herd screens), fall back to herd name hash (journal)
  const color =
    bar.scheduleType === "pasture"
      ? "#4CAF50"
      : bar.scheduleType === "exercise_yard"
        ? "#FF9800"
        : stringToColor(bar.herdName);

  // How far today falls within this bar (in pixels from the bar's left edge)
  const todayOffset = todayLeft - left;
  // Past portion: from bar start up to today (clamped to bar bounds)
  const pastWidth = Math.min(Math.max(todayOffset, 0), barWidth);
  // Future portion: everything after today within this bar
  const futureWidth = barWidth - pastWidth;
  const hasPast = pastWidth > 0;
  const hasFuture = futureWidth > 0;

  const showLabel = barWidth > 50;
  const solidBgColor = hexToRgba(color, 0.75);
  const futureBgColor = hexToRgba(color, 0.25);
  const futureBorderColor = hexToRgba(color, 0.55);

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
        justifyContent: "center",
        paddingHorizontal: 4,
      }}
    >
      {/* Past portion — solid fill */}
      {hasPast && (
        <View
          style={{
            position: "absolute",
            left: 0,
            width: pastWidth,
            top: 0,
            bottom: 0,
            backgroundColor: solidBgColor,
            // Round only the left corners when a future portion follows
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            borderTopRightRadius: hasFuture ? 0 : 4,
            borderBottomRightRadius: hasFuture ? 0 : 4,
            overflow: "hidden",
          }}
        >
          {/* Semi-transparent overlay on right edge for open-ended schedules */}
          {bar.isOpenEnded && !hasFuture && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: Math.min(20, pastWidth * 0.3),
                backgroundColor: hexToRgba("#ffffff", 0.35),
              }}
            />
          )}
        </View>
      )}

      {/* Future portion — lighter fill with dashed border to signal projection */}
      {hasFuture && (
        <View
          style={{
            position: "absolute",
            left: pastWidth,
            width: futureWidth,
            top: 0,
            bottom: 0,
            backgroundColor: futureBgColor,
            // Round only the right corners when a past portion precedes
            borderTopLeftRadius: hasPast ? 0 : 4,
            borderBottomLeftRadius: hasPast ? 0 : 4,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: futureBorderColor,
            borderLeftWidth: hasPast ? 0 : 1.5,
          }}
        />
      )}

      {/* Label rendered on top of both portions */}
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
    </TouchableOpacity>
  );
});
