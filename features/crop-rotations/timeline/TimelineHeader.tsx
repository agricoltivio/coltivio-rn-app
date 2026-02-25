import { memo } from "react";
import { View, Text } from "react-native";
import { useTheme } from "styled-components/native";
import { GridLine } from "./timeline-utils";

type TimelineHeaderProps = {
  gridLines: GridLine[];
  scale: number;
  contentWidth: number;
};

const HEADER_HEIGHT = 28;

export { HEADER_HEIGHT as TIMELINE_HEADER_HEIGHT };

export const TimelineHeader = memo(function TimelineHeader({
  gridLines,
  scale,
  contentWidth,
}: TimelineHeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: contentWidth,
        height: HEADER_HEIGHT,
        position: "relative",
      }}
    >
      {gridLines.map((line) => {
        const x = line.day * scale;
        return (
          <View
            key={`${line.day}-${line.label}`}
            style={{
              position: "absolute",
              left: x,
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
                backgroundColor: line.isMajor
                  ? theme.colors.gray3
                  : theme.colors.gray4,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: line.isMajor ? "700" : "500",
                color: line.isMajor ? theme.colors.gray1 : theme.colors.gray2,
                position: "absolute",
                left: 4,
                top: 6,
              }}
              numberOfLines={1}
            >
              {line.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
});
