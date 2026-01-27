import { locale } from "@/locales/i18n";
import { stringToColor } from "@/theme/theme";
import { Subtitle } from "@/theme/Typography";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { stackDataItem } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";
import { useHarvestSummariesOfFarm } from "../harvests/harvests.hooks";
import { HarvestStackChart } from "../harvests/HarvestStackChart";
import { HomeTile } from "./HomeTile";

export function ForagesHarvestTile() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { harvestSummaries } = useHarvestSummariesOfFarm();
  if (!harvestSummaries) {
    return null;
  }
  const currentYear = new Date().getFullYear();
  const harvestSummariesForCurrentYear = harvestSummaries.filter(
    (summary) => summary.year === currentYear,
  );

  const forageNames = new Set(
    harvestSummariesForCurrentYear.flatMap((summary) =>
      summary.producedQuantities.map(
        (producedQuantity) => producedQuantity.forageName,
      ),
    ),
  );
  const data: stackDataItem[] = [];
  for (let {
    year,
    month,
    producedQuantities,
  } of harvestSummariesForCurrentYear) {
    const monthLabel = new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(new Date(year, month));

    data.push({
      label: monthLabel,
      stacks: producedQuantities.map(({ forageName, totalAmountInKilos }) => ({
        value: totalAmountInKilos / 100,
        color: stringToColor(forageName),
      })),
    });
  }

  return (
    <HomeTile
      title="Futterbau"
      onPress={() => navigation.navigate("FieldCalendar")}
    >
      <View style={{ padding: theme.spacing.m }}>
        {/* <HarvestStackChart stackChartData={data} labels={[...forageNames]} /> */}
        {data.length === 0 ? (
          <Subtitle
            style={{
              color: theme.colors.gray2,
              position: "absolute",
              top: 60,
              left: 100,
            }}
          >
            keine Ernte in diesem Jahr
          </Subtitle>
        ) : null}
      </View>
    </HomeTile>
  );
}
