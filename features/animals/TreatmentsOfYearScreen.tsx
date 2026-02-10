import { Treatment } from "@/api/treatments.api";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { TreatmentsOfYearScreenProps } from "./navigation/animals-routes";

export function TreatmentsOfYearScreen({
  navigation,
  route,
}: TreatmentsOfYearScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { year, treatments } = route.params;
  const [searchText, setSearchText] = useState("");

  // Fuse.js search on treatment name, animal names, notes
  const fuse = new Fuse(treatments, {
    minMatchCharLength: 1,
    keys: ["name", "animals.name", "notes"],
  });

  let searchResult = treatments;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = useCallback(
    ({ item: treatment }: { item: Treatment }) => {
      const dateStr = formatLocalizedDate(new Date(treatment.date), locale);
      // Show first animal name, or count if multiple
      const animalDisplay =
        treatment.animals.length === 1
          ? treatment.animals[0].name
          : treatment.animals.length > 1
            ? `${treatment.animals.length} ${t("animals.animals")}`
            : "";
      return (
        <ListItem
          key={treatment.id}
          onPress={() =>
            navigation.navigate("EditTreatment", { treatmentId: treatment.id })
          }
        >
          <ListItem.Content>
            <ListItem.Title>
              {dateStr} · {animalDisplay}
            </ListItem.Title>
            <ListItem.Body>{treatment.name}</ListItem.Body>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      );
    },
    [navigation, t]
  );

  return (
    <ContentView headerVisible>
      <ScrollView showHeaderOnScroll headerTitleOnScroll={year.toString()}>
        <H2>{year}</H2>

        {/* Search bar */}
        <View style={{ marginTop: theme.spacing.m }}>
          <TextInput
            hideLabel
            placeholder={t("forms.placeholders.search")}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>

        <View style={{ marginTop: theme.spacing.m }}>
          {searchResult.length === 0 && (
            <Subtitle>{t("treatments.no_treatments")}</Subtitle>
          )}
          {searchResult.length > 0 && (
            <FlatList
              scrollEnabled={false}
              contentContainerStyle={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
              data={searchResult}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
