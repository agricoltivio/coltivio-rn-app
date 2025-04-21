import { FertilizerApplication } from "@/api/fertilizerApplications.api";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { FertilizerApplicationsOfYearListScreenProps } from "./navigation/fertilizer-application-routes";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFertilizerApplicationsQuery } from "./fertilizerApplications.hooks";
import { locale } from "@/locales/i18n";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { round } from "@/utils/math";

export function FertilizerApplicationsOfYearListScreen({
  route,
  navigation,
}: FertilizerApplicationsOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const fromDate = new Date(year, 0, 1); // January 1st of the specified year
  const toDate = new Date(year + 1, 0, 1); // January 1st of the next year
  const { fertilizerApplications } = useFertilizerApplicationsQuery(
    fromDate,
    toDate
  );
  const [searchText, setSearchText] = useState("");

  if (!fertilizerApplications) {
    return null;
  }

  const sanitizedFertilizerApplications = fertilizerApplications.map(
    (fertilizerApplication) => ({
      ...fertilizerApplication,
      date: formatLocalizedDate(
        new Date(fertilizerApplication.date),
        locale,
        "long",
        false
      ),
    })
  );

  const fuse = new Fuse(sanitizedFertilizerApplications ?? [], {
    minMatchCharLength: 1,
    keys: ["date", "fertilizer.name", "plot.name"],
  });

  let searchResult = sanitizedFertilizerApplications;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: fertilizerApplication,
  }: {
    item: FertilizerApplication;
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
          {t("plots.plot_name_date", {
            name: fertilizerApplication.plot.name,
            date: fertilizerApplication.date,
          })}
        </ListItem.Title>
        <ListItem.Body>
          {round(
            fertilizerApplication.numberOfApplications *
              fertilizerApplication.amountPerApplication,
            2
          )}
          {fertilizerApplication.unit} {fertilizerApplication.fertilizer.name}
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <H2 style={{ flex: 1 }}>
          {t("fertilizer_application.fertilizer_application_year", {
            year: route.params.year,
          })}
        </H2>
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
