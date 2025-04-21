import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { FertilizerApplicationsOfYearScreenProps } from "./navigation/fertilizer-application-routes";
import { stringToColor } from "@/theme/theme";
import { H2, Subtitle } from "@/theme/Typography";
import React, { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";
import { useFertilizerApplicationSummaryOfFarmQuery } from "./fertilizerApplications.hooks";
import { useTranslation } from "react-i18next";

function Legend({ labels }: { labels: string[] }) {
  const theme = useTheme();
  return (
    <View
      style={{
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

export function FertilizerApplicationsOfYearScreen({
  route,
  navigation,
}: FertilizerApplicationsOfYearScreenProps) {
  const { year } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();
  const { applicationSummaries } = useFertilizerApplicationSummaryOfFarmQuery();
  const [width, setWidth] = useState(0);

  function onLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    setWidth(width);
  }

  if (!applicationSummaries) {
    return null;
  }

  const summariesForSelectedYear = applicationSummaries.filter(
    (summary) => summary.year === year
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
            {t("common.total_amount_w_unit", {
              amount: chartByFertilizer[fertilizerName].data.reduce(
                (total, item) => total + item.value,
                0
              ),
              unit: chartByFertilizer[fertilizerName].unit,
            })}
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
              navigation.navigate("FertilizerApplicationsOfYearList", {
                year,
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
          { year }
        )}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <H2 style={{ flex: 1 }}>
            {t("fertilizer_application.fertilizer_application_year", { year })}
          </H2>
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
