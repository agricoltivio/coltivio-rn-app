import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { PlotHarvestsOfYearScreenProps } from "./navigation/plots-routes";
import { stringToColor } from "@/theme/theme";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { PieChart, stackDataItem } from "react-native-gifted-charts";
import { useTheme } from "styled-components/native";
import { useHarvestSummariesOfPlotQuery } from "../harvests/harvests.hooks";
import { HarvestStackChart } from "../harvests/HarvestStackChart";
import { ConservationMethod } from "@/api/harvests.api";

export function PlotHarvestsOfYearScreen({
  route,
  navigation,
}: PlotHarvestsOfYearScreenProps) {
  const { t } = useTranslation();
  const { year, name, plotId } = route.params;
  const theme = useTheme();
  const { harvestSummaries } = useHarvestSummariesOfPlotQuery(plotId);

  if (!harvestSummaries) {
    return null;
  }

  const harvestSummariesForSelectedYear = harvestSummaries.filter(
    (summary) => summary.year === year,
  );

  const totalAmountsSummary = harvestSummariesForSelectedYear.reduce<{
    [key: string]: {
      amount: number;
      cropName: string;
      conservationMethod?: string | null;
    };
  }>((acc, { producedQuantities }) => {
    for (const producedQuantity of producedQuantities) {
      if (producedQuantity.totalAmountInKilos === 0) {
        continue;
      }
      const key = `${producedQuantity.forageName} - ${producedQuantity.conservationMethod}`;
      if (!acc[key]) {
        acc[key] = {
          amount: 0,
          cropName: producedQuantity.forageName,
          conservationMethod: producedQuantity.conservationMethod,
        };
      }
      acc[key].amount += producedQuantity.totalAmountInKilos;
    }
    return acc;
  }, {});

  const pieData = Object.values(totalAmountsSummary).map((summary) => ({
    value: summary.amount,
    color: stringToColor(summary.cropName + summary.conservationMethod),
  }));

  const chartByForageType: Record<string, stackDataItem[]> = {};
  const legendByForageType: Record<
    string,
    Record<
      string,
      {
        text: string;
        color: string;
      }
    >
  > = {};
  for (let { month, producedQuantities } of harvestSummariesForSelectedYear) {
    const monthLabel = new Intl.DateTimeFormat(locale, {
      month: "short",
    }).format(new Date(year, month));
    const itemsOfMonthByCropName: Record<string, stackDataItem> = {};
    for (const producedQuantity of producedQuantities) {
      if (producedQuantity.totalAmountInKilos === 0) {
        continue;
      }
      if (!itemsOfMonthByCropName[producedQuantity.forageName]) {
        itemsOfMonthByCropName[producedQuantity.forageName] = {
          label: monthLabel,
          stacks: [],
        };
      }
      itemsOfMonthByCropName[producedQuantity.forageName].stacks.push({
        value: producedQuantity.totalAmountInKilos / 100,
        color: stringToColor(
          producedQuantity.forageName + producedQuantity.conservationMethod,
        ),
      });
      if (!legendByForageType[producedQuantity.forageName]) {
        legendByForageType[producedQuantity.forageName] = {};
      }
      if (producedQuantity.conservationMethod) {
        legendByForageType[producedQuantity.forageName][
          producedQuantity.conservationMethod
        ] = {
          text: t(
            `harvests.labels.conservation_method.${producedQuantity.conservationMethod as ConservationMethod}`,
          ),
          color: stringToColor(
            producedQuantity.forageName + producedQuantity.conservationMethod,
          ),
        };
      }
    }
    Object.entries(itemsOfMonthByCropName).forEach(([cropName, item]) => {
      if (!chartByForageType[cropName]) {
        chartByForageType[cropName] = [];
      }
      chartByForageType[cropName].push(item);
    });
  }
  const charts = Object.keys(chartByForageType).map((forageName) => (
    <Card key={forageName}>
      <Card.Title style={{ flex: 1 }}>{forageName}</Card.Title>
      <Card.Content>
        <HarvestStackChart
          stackChartData={chartByForageType[forageName]}
          labels={Object.values(legendByForageType[forageName])}
        />
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
            onPress={() =>
              navigation.navigate("PlotHarvestsOfYearList", {
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
        headerTitleOnScroll={t("harvests.harvest_year", { year })}
      >
        <View>
          <H2>{t("harvests.harvest_year", { year })}</H2>
          <H3>{t("plots.plot_name", { name })}</H3>
        </View>
        <Card style={{ marginVertical: theme.spacing.m }}>
          <Card.Title style={{ flex: 1 }}>Total </Card.Title>
          {pieData.length ? (
            <Card.Content
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.m,
              }}
            >
              <PieChart
                showText
                donut
                focusOnPress
                textColor="black"
                radius={80}
                textSize={17}
                // showTextBackground
                textBackgroundRadius={26}
                data={pieData}
              />
              <Legend
                labels={Object.values(totalAmountsSummary).map((summary) => ({
                  text: `${summary.cropName} (${t(`harvests.labels.conservation_method.${summary.conservationMethod as ConservationMethod}`)}): ${(summary.amount / 1000).toPrecision(2)}t`,
                  color: stringToColor(
                    summary.cropName + summary.conservationMethod,
                  ),
                }))}
              />
            </Card.Content>
          ) : null}
        </Card>
        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.m }}>
          {charts}
        </View>
      </ScrollView>
    </ContentView>
  );
}

function Legend({ labels }: { labels: { text: string; color: string }[] }) {
  const theme = useTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        marginBottom: theme.spacing.m,
        // flexDirection: "row",
        // flexWrap: "wrap",
        // maxWidth: 300,
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
              fontSize: 16,
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
