import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView as RNScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { BatchSelectAnimalsScreenProps } from "./navigation/animals-routes";

export function BatchSelectAnimalsScreen({
  navigation,
}: BatchSelectAnimalsScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const { animals, isLoading } = useAnimalsQuery();

  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [showDead, setShowDead] = useState(false);

  const animalTypes = useMemo(() => {
    return [...new Set(animals?.map((animal) => animal.type))];
  }, [animals]);

  // Filter: exclude dead animals unless showDead, apply type filter and selected-only filter
  const filteredAnimals = useMemo(() => {
    let result = animals ?? [];
    if (!showDead) {
      result = result.filter((a) => !a.dateOfDeath);
    }

    if (selectedTypes.size > 0) {
      result = result.filter((a) => selectedTypes.has(a.type));
    }
    if (showSelectedOnly) {
      result = result.filter((a) => selectedIds.has(a.id));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [animals, showDead, selectedTypes, showSelectedOnly, selectedIds]);

  const fuse = new Fuse(filteredAnimals, {
    minMatchCharLength: 1,
    keys: ["name", "type", "earTag.number"],
  });

  let searchResult = filteredAnimals;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  function toggleType(animalType: string) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(animalType)) {
        next.delete(animalType);
      } else {
        next.add(animalType);
      }
      return next;
    });
  }

  function toggleSelection(animalId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(animalId)) {
        next.delete(animalId);
      } else {
        next.add(animalId);
      }
      return next;
    });
  }

  function handleSelectAll() {
    const visibleIds = searchResult.map((a) => a.id);
    setSelectedIds(new Set(visibleIds));
  }

  function handleClearAll() {
    setSelectedIds(new Set());
  }

  function handleNext() {
    navigation.navigate("BatchEditAction", {
      animalIds: Array.from(selectedIds),
    });
  }

  const renderItem = useCallback(
    ({ item }: { item: AnimalWithWaitingTimeFlag }) => (
      <ListItem
        style={{ paddingVertical: 5 }}
        onPress={() => toggleSelection(item.id)}
      >
        <ListItem.Checkbox checked={selectedIds.has(item.id)} />
        <ListItem.Content>
          <ListItem.Title>
            {item.earTag?.number ? `${item.earTag.number} - ` : ""}
            {item.name} ({t(`animals.animal_types.${item.type}`)})
          </ListItem.Title>
          <ListItem.Body>
            {formatLocalizedDate(new Date(item.dateOfBirth), locale)}
          </ListItem.Body>
        </ListItem.Content>
      </ListItem>
    ),
    [selectedIds, t, locale],
  );

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={`${t("buttons.next")} (${selectedIds.size})`}
            onPress={handleNext}
            disabled={selectedIds.size === 0}
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("animals.batch_edit.select_animals_title")}</H2>

      {/* Search bar */}
      <View style={{ marginTop: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>

      {/* Filter chips */}
      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: theme.spacing.s, flexGrow: 0 }}
        contentContainerStyle={{ gap: theme.spacing.xs }}
      >
        <FilterChip
          label={t("animals.selected_only")}
          active={showSelectedOnly}
          onPress={() => setShowSelectedOnly((prev) => !prev)}
          theme={theme}
        />
        <FilterChip
          label={t("animals.show_dead")}
          active={showDead}
          onPress={() => setShowDead((prev) => !prev)}
          theme={theme}
        />
        {animalTypes.map((animalType) => (
          <FilterChip
            key={animalType}
            label={t(`animals.animal_types.${animalType}`)}
            active={selectedTypes.has(animalType)}
            onPress={() => toggleType(animalType)}
            theme={theme}
          />
        ))}
      </RNScrollView>

      {/* Select all / Clear buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: theme.spacing.m,
        }}
      >
        <TouchableOpacity onPress={handleSelectAll}>
          <Subtitle style={{ color: theme.colors.primary }}>
            {t("treatments.select_all", { count: searchResult.length })}
          </Subtitle>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearAll}>
          <Subtitle style={{ color: theme.colors.gray1 }}>
            {t("treatments.clear_selection")}
          </Subtitle>
        </TouchableOpacity>
      </View>

      {/* Animal list */}
      <View style={{ marginTop: theme.spacing.s, flex: 1 }}>
        {!isLoading && searchResult.length === 0 && (
          <Subtitle>{t("common.no_entries")}</Subtitle>
        )}
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor:
              searchResult.length > 0 ? theme.colors.white : undefined,
          }}
          data={searchResult}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </ContentView>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: { colors: Record<string, string>; spacing: Record<string, number> };
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: active ? theme.colors.primary : theme.colors.white,
        borderWidth: 1,
        borderColor: active ? theme.colors.primary : theme.colors.gray3,
      }}
    >
      <Subtitle
        style={{
          color: active ? theme.colors.white : theme.colors.gray1,
          fontSize: 14,
        }}
      >
        {label}
      </Subtitle>
    </TouchableOpacity>
  );
}
