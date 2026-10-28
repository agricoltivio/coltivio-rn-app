import { ReactNode, useState } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

// Floating card shown while a chart is touched, centered above anchorX and kept
// inside the chart. Positioned absolutely so its size doesn't move the chart.
export function ChartTooltipCard({
  anchorX,
  chartWidth,
  children,
}: {
  anchorX: number;
  chartWidth: number;
  children: ReactNode;
}) {
  const theme = useTheme();
  const [tooltipWidth, setTooltipWidth] = useState(0);
  const left = Math.min(
    Math.max(0, anchorX - tooltipWidth / 2),
    Math.max(0, chartWidth - tooltipWidth),
  );

  return (
    <View
      pointerEvents="none"
      onLayout={(event) => setTooltipWidth(event.nativeEvent.layout.width)}
      style={{
        position: "absolute",
        top: 0,
        left,
        borderRadius: theme.radii.m,
        backgroundColor: theme.colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      {children}
    </View>
  );
}
