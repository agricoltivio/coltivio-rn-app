import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { CropProtectionApplicationsOfYearScreenProps } from "./navigation/crop-protection-application-routes";
import { stringToColor } from "@/theme/theme";
import { H2, Subtitle } from "@/theme/Typography";
import React, { useState } from "react";
import { LayoutChangeEvent, Text, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";
import { useCropProtectionApplicationSummariesOfFarmQuery } from "./cropProtectionApplications.hooks";
import { useTranslation } from "react-i18next";
import { round } from "@/utils/math";

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

export function CropProtectionApplicationsOfYearScreen({
  route,
  navigation,
}: CropProtectionApplicationsOfYearScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const { applicationSummaries } =
    useCropProtectionApplicationSummariesOfFarmQuery();
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
  const charts = Object.keys(chartByProduct).map((cropProtectionName) => (
    <Card key={cropProtectionName}>
      <Card.Title style={{ flex: 1 }}>{cropProtectionName}</Card.Title>
      <Card.Content>
        <BarChart
          data={chartByProduct[cropProtectionName].data}
          spacing={35}
          width={width - 130}
          rulesThickness={1}
          rulesColor={theme.colors.gray4}
          height={100}
          formatYLabel={(value) =>
            `${round(Number(value), 2)}${chartByProduct[cropProtectionName].unit}`
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
            {t("forms.labels.total_w_amount_unit", {
              amount: chartByProduct[cropProtectionName].data.reduce(
                (total, item) => total + item.value,
                0
              ),
              unit: chartByProduct[cropProtectionName].unit,
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
              navigation.navigate("CropProtectionApplicationsOfYearList", {
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
          "crop_protection_applications.crop_protection_year",
          {
            year,
          }
        )}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <H2 style={{ flex: 1 }}>
            {t("crop_protection_applications.crop_protection_year", {
              year,
            })}
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
