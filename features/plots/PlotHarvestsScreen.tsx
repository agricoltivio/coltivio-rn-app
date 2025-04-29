import { List } from "@/components/list/List";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Headline } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotHarvestsScreenProps } from "./navigation/plots-routes";
import { useHarvestsOfPlotQuery } from "../harvests/harvests.hooks";
import { useTranslation } from "react-i18next";

export function PlotHarvestsScreen({
  navigation,
  route,
}: PlotHarvestsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;
  const { harvests } = useHarvestsOfPlotQuery(plotId);

  if (!harvests) {
    return null;
  }
  const years = [
    ...new Set(harvests.map((harvest) => new Date(harvest.date).getFullYear())),
  ];
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("harvests.harvest")}
      >
        <H2>{t("harvests.harvest")}</H2>
        <H3>{t("plots.plot_name", { name })}</H3>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {harvests.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {years.map((year) => (
                <List.Item
                  key={year}
                  title={year.toString()}
                  onPress={() =>
                    navigation.navigate("PlotHarvestsOfYear", {
                      year: Number(year),
                      plotId,
                      name,
                    })
                  }
                />
              ))}
            </List>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
