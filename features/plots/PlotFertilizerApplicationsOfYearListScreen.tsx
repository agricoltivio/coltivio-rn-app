import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { PlotFertilizerApplicationsOfYearListScreenProps } from "./navigation/plots-routes";
import { H2, H3 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFertilizerApplicationsForPlotQuery } from "../fertilizer-application/fertilizerApplications.hooks";
import { useTranslation } from "react-i18next";

export function PlotFertilizerApplicationsOfYearListScreen({
  route,
  navigation,
}: PlotFertilizerApplicationsOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year, name, plotId } = route.params;
  const theme = useTheme();
  const { fertilizerApplications } =
    useFertilizerApplicationsForPlotQuery(plotId);
  const [searchText, setSearchText] = useState("");

  if (!fertilizerApplications) {
    return null;
  }

  const sanitizedFertilizerApplications = fertilizerApplications.map(
    (fertilizerApplication) => ({
      ...fertilizerApplication,
      date: formatLocalizedDate(new Date(fertilizerApplication.date), locale),
    })
  );

  const fuse = new Fuse(sanitizedFertilizerApplications ?? [], {
    minMatchCharLength: 1,
    keys: ["date", "fertilizer.name", "fertilizer.type"],
  });

  let searchResult = sanitizedFertilizerApplications;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: fertilizerApplication,
  }: {
    item: (typeof sanitizedFertilizerApplications)[number];
  }) => (
    <ListItem
      key={fertilizerApplication.id}
      onPress={() =>
        navigation.navigate("FertilizerApplicationDetails", {
          fertilizerApplicationId: fertilizerApplication.id,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>
          {fertilizerApplication.date}
        </ListItem.Title>
        <ListItem.Body>
          {fertilizerApplication.numberOfApplications *
            fertilizerApplication.amountPerApplication}
          {fertilizerApplication.unit} {fertilizerApplication.fertilizer.name}
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View>
        <H2>
          {t("fertilizer_application.fertilizer_application_year", { year })}
        </H2>
        <H3>{t("plots.plot_name", { name })}</H3>
      </View>
      <View style={{ marginVertical: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>

      <FlatList
        contentContainerStyle={{
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
          overflow: "hidden",
          backgroundColor: theme.colors.white,
        }}
        data={searchResult}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </ContentView>
  );
}
