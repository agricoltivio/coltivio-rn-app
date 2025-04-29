import { List } from "@/components/list/List";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Headline } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotFertilizerApplicationsScreenProps } from "./navigation/plots-routes";
import { useFertilizerApplicationsForPlotQuery } from "../fertilizer-application/fertilizerApplications.hooks";
import { useTranslation } from "react-i18next";

export function PlotFertilizerApplicationsScreen({
  navigation,
  route,
}: PlotFertilizerApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;
  const { fertilizerApplications } =
    useFertilizerApplicationsForPlotQuery(plotId);

  if (!fertilizerApplications) {
    return null;
  }
  const years = [
    ...new Set(
      fertilizerApplications.map((fertilizerApplication) =>
        new Date(fertilizerApplication.date).getFullYear()
      )
    ),
  ];
  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("fertilizer_application.fertilizer_application")}
      >
        <H2>{t("fertilizer_application.fertilizer_application")}</H2>
        <H3>{t("plots.plot_name", { name })}</H3>
        <View
          style={{
            marginTop: theme.spacing.m,
          }}
        >
          {fertilizerApplications.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <List>
              {years.map((year) => (
                <List.Item
                  key={year}
                  title={year.toString()}
                  onPress={() =>
                    navigation.navigate("PlotFertilizerApplicationsOfYear", {
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
