import { LayoutChangeEvent, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { BarChart, stackDataItem } from "react-native-gifted-charts";
import { useState } from "react";

function Legend({ labels }: { labels: { text: string; color: string }[] }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: theme.spacing.s,
      }}
    >
      {labels.map((label) => (
        <View
          key={label.text}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: label.color,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 15,
              marginRight: theme.spacing.m,
              color: theme.colors.gray2,
            }}
          >
            {label.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

export type HarvestStackChartProps = {
  stackChartData: stackDataItem[];
  labels: { text: string; color: string }[];
};

export function HarvestStackChart({
  stackChartData,
  labels,
}: HarvestStackChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    setWidth(width - 45);
  }
  const spacing = stackChartData.length > 9 ? 2 : 5;
  const barWidth = width / stackChartData.length - spacing;
  return (
    <View onLayout={onLayout} style={{ flex: 1 }}>
      <BarChart
        stackData={stackChartData}
        barWidth={barWidth > 30 ? 30 : barWidth}
        spacing={spacing}
        width={width}
        rulesThickness={1}
        rulesColor={theme.colors.gray4}
        height={100}
        formatYLabel={(value) => `${Math.round(Number(value) * 100) / 100} dt`}
        xAxisThickness={1}
        xAxisColor={theme.colors.gray4}
        xAxisType="dashed"
        yAxisThickness={0}
        yAxisTextStyle={{ color: theme.colors.gray2 }}
        yAxisLabelWidth={60}
        xAxisLabelTextStyle={{ color: theme.colors.gray2 }}
        noOfSections={3}
        disablePress
      />
      <Legend labels={labels} />
    </View>
  );
}
