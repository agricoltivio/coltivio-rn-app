import { Harvest } from "@/api/harvests.api";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { HarvestOfYearListScreenProps } from "./navigation/harvest-routes";
import { H2 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useHarvestsQuery } from "./harvests.hooks";
import { round } from "@/utils/math";

export function HarvestListScreen({
  route,
  navigation,
}: HarvestOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const fromDate = new Date(year, 0, 1); // January 1st of the specified year
  const toDate = new Date(year + 1, 0, 1); // January 1st of the next year
  const { harvests } = useHarvestsQuery(fromDate, toDate);
  const [searchText, setSearchText] = useState("");

  if (!harvests) {
    return null;
  }

  const sanitizedHarvests = harvests?.map(
    ({ date, processingType, conservationMethod, crop, ...harvest }) => ({
      date: formatLocalizedDate(new Date(date), locale, "long", false),
      processingType: t(`harvests.labels.processing_type.${processingType}`),
      conservationMethod: t(
        `harvests.labels.conservation_method.${conservationMethod}`
      ),
      cropName: crop.name,
      unit: t(`harvests.labels.unit.${processingType}`),
      ...harvest,
    })
  );

  const fuse = new Fuse(sanitizedHarvests ?? [], {
    minMatchCharLength: 1,
    keys: [
      "date",
      "processingType",
      "conservationMethod",
      "crop.name",
      "plot.name",
    ],
  });

  let searchResult = sanitizedHarvests;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: harvest,
  }: {
    item: Omit<Harvest, "crop" | "processingType" | "conservationMethod"> & {
      cropName: string;
      processingType: string;
      conservationMethod: string;
      unit: string;
    };
  }) => (
    <ListItem
      key={harvest.id}
      onPress={() =>
        navigation.navigate("HarvestDetails", {
          harvestId: harvest.id,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>
          {t("plots.plot_name_date", {
            name: harvest.plot.name,
            date: harvest.date,
          })}
        </ListItem.Title>
        <ListItem.Body>
          {round(harvest.producedUnits * harvest.kilosPerUnit, 2)}kg,{" "}
          {harvest.cropName}, {harvest.conservationMethod},{" "}
          {harvest.processingType}
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <H2 style={{ flex: 1 }}>{t("harvests.harvest_year", { year })}</H2>
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
