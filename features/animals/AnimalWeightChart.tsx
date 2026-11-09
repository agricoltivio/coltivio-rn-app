import { AnimalWeight } from "@/api/breeding.api";
import { parseDateOnly } from "@/utils/date";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutChangeEvent, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";

const CHART_HEIGHT = 180;
const Y_AXIS_WIDTH = 40;

// Weight timeline, entries are expected sorted by date ascending
export function AnimalWeightChart({ weights }: { weights: AnimalWeight[] }) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [chartWidth, setChartWidth] = useState(0);

  const weightValues = weights.map((weight) => weight.weightKg);
  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  // Start the y-axis below the lowest weight so changes are visible
  const yAxisOffset = Math.max(0, Math.floor(minWeight * 0.9));
  const chartData = weights.map((weight) => ({
    value: weight.weightKg,
    // Short year ("1.6.25") keeps the labels narrow enough for the point spacing
    label: new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    }).format(parseDateOnly(weight.date)),
    dataPointText: String(weight.weightKg),
  }));
  const spacing =
    weights.length > 1
      ? Math.max(56, (chartWidth - Y_AXIS_WIDTH - 40) / (weights.length - 1))
      : 56;

  return (
    <View
      onLayout={(event: LayoutChangeEvent) =>
        setChartWidth(event.nativeEvent.layout.width)
      }
    >
      {chartWidth > 0 && (
        <LineChart
          data={chartData}
          height={CHART_HEIGHT}
          width={chartWidth - Y_AXIS_WIDTH}
          yAxisLabelWidth={Y_AXIS_WIDTH}
          spacing={spacing}
          initialSpacing={20}
          endSpacing={20}
          yAxisOffset={yAxisOffset}
          maxValue={Math.ceil(maxWeight * 1.05) - yAxisOffset}
          noOfSections={4}
          color={theme.colors.primary}
          dataPointsColor={theme.colors.primary}
          thickness={2}
          areaChart
          startFillColor={theme.colors.primary}
          endFillColor={theme.colors.primary}
          startOpacity={0.2}
          endOpacity={0.02}
          textColor={theme.colors.gray1}
          textFontSize={11}
          textShiftY={-6}
          xAxisLabelTextStyle={{ color: theme.colors.gray2, fontSize: 10 }}
          yAxisTextStyle={{ color: theme.colors.gray2, fontSize: 10 }}
          rulesColor={theme.colors.gray4}
          xAxisColor={theme.colors.gray3}
          yAxisColor={theme.colors.gray3}
          scrollToEnd
        />
      )}
    </View>
  );
}
