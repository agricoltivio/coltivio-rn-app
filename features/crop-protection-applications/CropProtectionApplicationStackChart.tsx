import { stringToColor } from "@/theme/theme";
import { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";

function Legend({ labels }: { labels: string[] }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: theme.spacing.m,
      }}
    >
      {labels.map((label) => (
        <View
          key={label}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: stringToColor(label),
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: 16,
              // width: 70,
              // height: 18,
              marginRight: theme.spacing.m,
              color: theme.colors.gray2,
            }}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export type CropProtectionApplicationChartProps = {
  data: barDataItem[];
  unitLabel: string;
};

export function CropProtectionApplicationStackChart({
  data,
  unitLabel,
}: CropProtectionApplicationChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    setWidth(width);
  }
  return (
    <View onLayout={onLayout} style={{ flex: 1 }}>
      <BarChart
        data={data}
        spacing={35}
        width={width - 80}
        rulesThickness={1}
        rulesColor={theme.colors.gray4}
        height={100}
        formatYLabel={(value) =>
          `${parseFloat(value).toPrecision(1)} ${unitLabel}`
        }
        yAxisLabelWidth={45}
        xAxisThickness={1}
        xAxisColor={theme.colors.gray4}
        xAxisType="dashed"
        yAxisThickness={0}
        yAxisTextStyle={{ color: theme.colors.gray2 }}
        xAxisLabelTextStyle={{ color: theme.colors.gray2 }}
        noOfSections={3}
        disablePress
      />
    </View>
  );
}
