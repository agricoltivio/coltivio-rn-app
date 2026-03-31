import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { SelectSingleAnimalScreenProps } from "./navigation/animals-routes";

export function SelectSingleAnimalModal({
  route,
  navigation,
}: SelectSingleAnimalScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const { animalType, previousScreen, rowIndex } = route.params;
  const { animals, isLoading } = useAnimalsQuery();

  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<"name" | "earTag" | "age">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Filter to matching type and living only, then sort
  const filteredAnimals = useMemo(() => {
    const result = (animals ?? []).filter(
      (a) => !a.dateOfDeath && a.type === animalType,
    );
    const multiplier = sortDir === "asc" ? 1 : -1;
    return [...result].sort((a, b) => {
      if (sortField === "earTag") {
        const at = a.earTag?.number ?? "";
        const bt = b.earTag?.number ?? "";
        return multiplier * at.localeCompare(bt, undefined, { numeric: true });
      }
      if (sortField === "age") {
        const ad = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : Infinity;
        const bd = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : Infinity;
        return multiplier * (ad - bd);
      }
      return multiplier * a.name.localeCompare(b.name);
    });
  }, [animals, animalType, sortField, sortDir]);

  const fuse = new Fuse(filteredAnimals, {
    minMatchCharLength: 1,
    keys: ["name", "earTag.number"],
  });

  const searchResult =
    searchText.length > 0
      ? fuse.search(searchText).map((r) => r.item)
      : filteredAnimals;

  function handleSelect(animal: AnimalWithWaitingTimeFlag) {
    navigation.popTo(
      previousScreen,
      { mergeSelection: { rowIndex, animalId: animal.id } },
      { merge: true },
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: AnimalWithWaitingTimeFlag }) => {
      const dateLabel = item.dateOfBirth
        ? formatLocalizedDate(new Date(item.dateOfBirth), locale)
        : null;
      return (
        <ListItem style={{ paddingVertical: 5 }} onPress={() => handleSelect(item)}>
          <ListItem.Content>
            <ListItem.Title>
              {item.earTag?.number ? `${item.earTag.number} - ` : ""}
              {item.name}
            </ListItem.Title>
            {dateLabel && <ListItem.Body>{dateLabel}</ListItem.Body>}
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      );
    },
    [locale],
  );

  return (
    <ContentView headerVisible>
      <H2>{t("animals.tvd_import.select_animal_for_merge")}</H2>

      <View style={{ marginTop: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>

      {/* Sort toolbar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          marginTop: theme.spacing.s,
          gap: theme.spacing.xs,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setSortField((f) =>
              f === "name" ? "earTag" : f === "earTag" ? "age" : "name",
            )
          }
        >
          <Subtitle style={{ textDecorationLine: "underline", color: theme.colors.primary }}>
            {sortField === "name"
              ? t("animals.sort_by_name")
              : sortField === "earTag"
                ? t("animals.sort_by_ear_tag")
                : t("animals.sort_by_age")}
          </Subtitle>
        </TouchableOpacity>
        <MaterialCommunityIconButton
          type="ghost"
          icon={sortDir === "asc" ? "sort-ascending" : "sort-descending"}
          iconSize={22}
          color={theme.colors.primary}
          onPress={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        />
      </View>

      <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
        {!isLoading && searchResult.length === 0 && (
          <Subtitle>{t("common.no_entries")}</Subtitle>
        )}
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor: searchResult.length > 0 ? theme.colors.white : undefined,
          }}
          data={searchResult}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </ContentView>
  );
}
