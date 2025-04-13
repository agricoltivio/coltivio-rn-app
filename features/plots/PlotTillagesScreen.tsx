import { List } from "@/components/list/List";
import { useTillagesForPlotQuery } from "../tillages/tillages.hooks";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Headline } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotTillagesScreenProps } from "@/navigation/rootStackTypes";
import { useTranslation } from "react-i18next";

export function PlotTillagesScreen({
  navigation,
  route,
}: PlotTillagesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;
  const { tillages } = useTillagesForPlotQuery(plotId);

  if (!tillages) {
    return null;
  }
  const years = [
    ...new Set(tillages.map((tillage) => new Date(tillage.date).getFullYear())),
  ];
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("tillages.tillage")}
      >
        <H2>{t("tillages.tillage")}</H2>
        <H3>{t("plots.plot_name", { name })}</H3>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {tillages.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {years.map((year) => (
                <List.Item
                  key={year}
                  title={year.toString()}
                  onPress={() =>
                    navigation.navigate("PlotTillagesOfYearList", {
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
