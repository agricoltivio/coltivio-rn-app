import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { TillagesOfYearListScreenProps } from "@/navigation/rootStackTypes";
import { H2 } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useTillagesQuery } from "./tillages.hooks";

export function TillagesOfYearListScreen({
  route,
  navigation,
}: TillagesOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const fromDate = new Date(year, 0, 1); // January 1st of the specified year
  const toDate = new Date(year + 1, 0, 1); // January 1st of the next year
  const { tillages } = useTillagesQuery(fromDate, toDate);
  const [searchText, setSearchText] = useState("");

  if (!tillages) {
    return null;
  }

  const sanitizedTillages = tillages.map((tillage) => ({
    ...tillage,
    date: formatLocalizedDate(new Date(tillage.date), locale, "long", false),
    reason: t(`tillages.reasons.${tillage.reason}`),
    action: t(`tillages.actions.${tillage.action}`),
  }));

  const fuse = new Fuse(sanitizedTillages ?? [], {
    minMatchCharLength: 1,
    keys: ["date", "reason", "action", "plot.name"],
  });

  let searchResult = sanitizedTillages;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const renderItem = ({
    item: tillage,
  }: {
    item: (typeof sanitizedTillages)[number];
  }) => (
    <ListItem
      key={tillage.id}
      onPress={() =>
        navigation.navigate("TillageDetails", {
          tillageId: tillage.id,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>
          {tillage.date} - {t("plots.plot_name", { name: tillage.plot.name })}
        </ListItem.Title>
        <ListItem.Body>
          {tillage.action} ({tillage.reason})
        </ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
  return (
    <ContentView headerVisible>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <H2 style={{ flex: 1 }}>{t("tillages.tillage_year", { year })}</H2>
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
