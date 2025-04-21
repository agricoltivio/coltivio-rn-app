import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { CropRotationsOfYearListScreenProps } from "./navigation/crop-rotations-routes";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropRotationsQuery } from "./crop-rotations.hooks";
import { locale } from "@/locales/i18n";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";

export function CropRotationsOfYearListScreen({
  route,
  navigation,
}: CropRotationsOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const fromDate = new Date(year, 0, 1); // January 1st of the specified year
  const toDate = new Date(year + 1, 0, 1); // January 1st of the next year
  const { cropRotations } = useCropRotationsQuery(fromDate, toDate);
  const [searchText, setSearchText] = useState("");

  if (!cropRotations) {
    return null;
  }

  const sanitizedCropRotations = cropRotations.map((cropRotation) => ({
    ...cropRotation,
    fromDate: formatLocalizedDate(
      new Date(cropRotation.fromDate),
      locale,
      "long",
      false
    ),
    toDate: cropRotation.toDate
      ? formatLocalizedDate(new Date(cropRotation.toDate), locale)
      : undefined,
  }));

  const fuse = new Fuse(sanitizedCropRotations ?? [], {
    minMatchCharLength: 1,
    keys: ["fromDate", "toDate", "crop.name", "crop.category", "plot.name"],
  });

  let searchResult = sanitizedCropRotations;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: cropRotation,
  }: {
    item: (typeof sanitizedCropRotations)[number];
  }) => (
    <ListItem
      key={cropRotation.id}
      onPress={() =>
        navigation.navigate("EditPlotCropRotation", {
          rotationId: cropRotation.id,
          plotName: cropRotation.plot.name,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>
          {t("plots.plot_name_date", {
            name: cropRotation.plot.name,
            date: cropRotation.fromDate,
          })}
        </ListItem.Title>
        <ListItem.Body>{cropRotation.crop.name}</ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <H2 style={{ flex: 1 }}>
          {t("crop_rotations.crop_rotation_year", { year: route.params.year })}
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
