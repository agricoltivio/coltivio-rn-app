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
import { PlotCropProtectionApplicationsOfYearScreenProps } from "@/navigation/rootStackTypes";
import { useCropProtectionApplicationSummariesOfPlotQuery } from "../crop-protection-applications/cropProtectionApplications.hooks";
import { useTranslation } from "react-i18next";

export function PlotCropProtectionApplicationsOfYearScreen({
  route,
  navigation,
}: PlotCropProtectionApplicationsOfYearScreenProps) {
  const { t } = useTranslation();
  const { year, plotId, name } = route.params;
  const theme = useTheme();
  const { applicationSummaries } =
    useCropProtectionApplicationSummariesOfPlotQuery(plotId);
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

  const chartByProduct: Record<string, { unit: string; data: barDataItem[] }> =
    {};
  for (let { month, appliedCropProtections } of summariesForSelectedYear) {
    const monthLabel = new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(new Date(year, month));
    for (const appliedCropProtection of appliedCropProtections) {
      if (appliedCropProtection.totalAmount === 0) {
        continue;
      }
      if (!chartByProduct[appliedCropProtection.productName]) {
        chartByProduct[appliedCropProtection.productName] = {
          data: [],
          unit: appliedCropProtection.unit,
        };
      }
      chartByProduct[appliedCropProtection.productName].data.push({
        value: appliedCropProtection.totalAmount,
        label: monthLabel,
        frontColor: stringToColor(appliedCropProtection.productName),
      });
    }
  }
  const charts = Object.keys(chartByProduct).map((productName) => (
    <Card key={productName}>
      <Card.Title style={{ flex: 1 }}>{productName}</Card.Title>
      <Card.Content>
        <BarChart
          data={chartByProduct[productName].data}
          spacing={35}
          width={width - 80}
          rulesThickness={1}
          rulesColor={theme.colors.gray4}
          height={100}
          formatYLabel={(value) =>
            `${value}${chartByProduct[productName].unit}`
          }
          xAxisThickness={1}
          xAxisColor={theme.colors.gray4}
          xAxisType="dashed"
          yAxisThickness={0}
          yAxisTextStyle={{ color: theme.colors.gray2 }}
          yAxisLabelWidth={45}
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
            {chartByProduct[productName].data.reduce(
              (total, item) => total + item.value,
              0
            )}
            {chartByProduct[productName].unit}
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
              navigation.navigate("PlotCropProtectionApplicationsOfYearList", {
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
          "crop_protection_applications.crop_protection_year",
          {
            year,
          }
        )}
      >
        <View>
          <H2>
            {t("crop_protection_applications.crop_protection_year", { year })}
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
