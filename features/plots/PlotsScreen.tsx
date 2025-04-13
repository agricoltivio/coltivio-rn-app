import { Plot } from "@/api/plots.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { PlotsScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useCallback, useState } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmPlotsQuery } from "./plots.hooks";
import { useTranslation } from "react-i18next";

export function PlotsScreen({ navigation }: PlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plots } = useFarmPlotsQuery();
  const [searchText, setSearchText] = useState("");

  const sanitizedPlots = plots?.map((plot) => ({
    ...plot,
    usageName: plot.usage
      ? //@ts-ignore
        t(`plots.usage_codes.${plot.usage}`)
      : t("common.unknown"),
  }));

  const fuse = new Fuse(sanitizedPlots ?? [], {
    minMatchCharLength: 1,
    keys: ["name", "usage", "usageName", "cropRotations[0].crop.name"],
  });

  let searchResult = sanitizedPlots;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = useCallback(
    ({ item: plot }: { item: Plot & { usageName: string } }) => (
      <ListItem
        key={plot.id}
        onPress={() =>
          navigation.navigate("PlotDetails", {
            plotId: plot.id,
          })
        }
      >
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>{plot.name}</ListItem.Title>
          <ListItem.Body>
            {plot.cropRotations[0].crop.name} ({plot.size / 100}
            a)
            {/* {t("common.area_acres", { area: plot.size / 100 })} */}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    []
  );
  return (
    <ContentView headerVisible>
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

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("AddPlotMap")}
      />
    </ContentView>
  );
}
