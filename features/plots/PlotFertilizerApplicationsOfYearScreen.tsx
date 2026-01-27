import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { stringToColor } from "@/theme/theme";
import { H2, H3, Subtitle } from "@/theme/Typography";
import React, { useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";
import { useFertilizerApplicationSummaryForPlotQuery } from "../fertilizer-application/fertilizerApplications.hooks";
import { PlotFertilizerApplicationsOfYearScreenProps } from "./navigation/plots-routes";
import { useTranslation } from "react-i18next";

export function PlotFertilizerApplicationsOfYearScreen({
  route,
  navigation,
}: PlotFertilizerApplicationsOfYearScreenProps) {
  const { t } = useTranslation();
  const { year, plotId, name } = route.params;
  const theme = useTheme();
  const { applicationSummaries } =
    useFertilizerApplicationSummaryForPlotQuery(plotId);
  const [width, setWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    setWidth(width);
  }

  if (!applicationSummaries) {
    return null;
  }

  const summariesForSelectedYear = applicationSummaries.filter(
    (summary) => summary.year === year,
  );

  const chartByFertilizer: Record<
    string,
    { unit: string; data: barDataItem[] }
  > = {};
  for (let { month, appliedFertilizers } of summariesForSelectedYear) {
    const monthLabel = new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(new Date(year, month));
    for (const appliedFertilizer of appliedFertilizers) {
      if (appliedFertilizer.totalAmount === 0) {
        continue;
      }
      if (!chartByFertilizer[appliedFertilizer.fertilizerName]) {
        chartByFertilizer[appliedFertilizer.fertilizerName] = {
          data: [],
          unit: appliedFertilizer.unit,
        };
      }
      chartByFertilizer[appliedFertilizer.fertilizerName].data.push({
        value: appliedFertilizer.totalAmount,
        label: monthLabel,
        frontColor: stringToColor(appliedFertilizer.fertilizerName),
      });
    }
  }
  const charts = Object.keys(chartByFertilizer).map((fertilizerName) => (
    <Card key={fertilizerName}>
      <Card.Title style={{ flex: 1 }}>{fertilizerName}</Card.Title>
      <Card.Content>
        <BarChart
          data={chartByFertilizer[fertilizerName].data}
          spacing={35}
          width={width - 130}
          rulesThickness={1}
          rulesColor={theme.colors.gray4}
          height={100}
          formatYLabel={(value) =>
            `${Math.round(Number(value) * 100) / 100}${chartByFertilizer[fertilizerName].unit}`
          }
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
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            marginTop: theme.spacing.m,
          }}
        >
          <Subtitle>
            Total{" "}
            {chartByFertilizer[fertilizerName].data.reduce(
              (total, item) => total + (item.value || 0),
              0,
            )}
            {chartByFertilizer[fertilizerName].unit}
          </Subtitle>
        </View>
      </Card.Content>
    </Card>
  ));

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            type="accent"
            title={t("buttons.show_entries")}
            style={{ marginTop: theme.spacing.m }}
            onPress={() =>
              navigation.navigate("PlotFertilizerApplicationsOfYearList", {
                year,
                name,
                plotId,
              })
            }
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t(
          "fertilizer_application.fertilizer_application_year",
          {
            year,
          },
        )}
      >
        <View>
          <H2>
            {t("fertilizer_application.fertilizer_application_year", {
              year,
            })}
          </H2>
          <H3>{t("plots.plot_name", { name })}</H3>
        </View>
        <View
          onLayout={onLayout}
          style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}
        >
          {charts}
        </View>
      </ScrollView>
    </ContentView>
  );
}
