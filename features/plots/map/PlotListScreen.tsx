import { Plot } from "@/api/plots.api";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotListScreenProps } from "../navigation/plots-routes";
import { useFarmPlotsQuery } from "../plots.hooks";

export function PlotListScreen({ navigation }: PlotListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plots } = useFarmPlotsQuery();
  const [searchText, setSearchText] = useState("");

  const sanitizedPlots: Array<Plot & { usageName: string }> =
    plots?.map((plot) => ({
      ...plot,
      usageName: plot.usage
        ? //@ts-ignore
          t(`plots.usage_codes.${plot.usage}`)
        : t("common.unknown"),
    })) ?? [];

  const fuse = new Fuse(sanitizedPlots, {
    minMatchCharLength: 1,
    keys: ["name", "usage", "usageName", "cropRotations[0].crop.name"],
  });

  let searchResult = sanitizedPlots;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const handlePlotSelect = useCallback(
    (plot: Plot) => {
      navigation.popTo("PlotsMap", { selectedPlotId: plot.id });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item: plot }: { item: Plot & { usageName: string } }) => (
      <ListItem key={plot.id} onPress={() => handlePlotSelect(plot)}>
        <ListItem.Content>
          <View style={{ flexDirection: "row" }}>
            <ListItem.Title numberOfLines={1} style={{ flex: 1 }}>
              {plot.name}
            </ListItem.Title>
            <ListItem.Body> ({plot.size / 100}a)</ListItem.Body>
          </View>
          <ListItem.Body>
            {t("crops.crop")}:{" "}
            {plot.currentCropRotation?.crop.name ?? t("crops.no_crop")}
          </ListItem.Body>
          {plot.localId ? (
            <ListItem.Body>
              {t("forms.labels.local_id")}: {plot.localId}
            </ListItem.Body>
          ) : null}
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [handlePlotSelect],
  );

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: theme.spacing.m,
        backgroundColor: theme.colors.background,
      }}
    >
      <H2>{t("plots.plots")}</H2>
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
    </View>
  );
}
