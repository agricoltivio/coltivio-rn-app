import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, getMinMaxIso } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ScrollView as RNScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { SelectAnimalsScreenProps } from "./navigation/animals-routes";
import { DateRangeFilterModal } from "@/components/filters/DateRangeFilterModal";

export function SelectAnimalsModal({
  route,
  navigation,
}: SelectAnimalsScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const { initialSelectedIds, previousScreen } = route.params;
  const { animals, isLoading } = useAnimalsQuery();

  const minMaxDateOfBirth = getMinMaxIso(
    animals?.map((a) => a.dateOfBirth) ?? [],
  );

  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialSelectedIds),
  );
  const [sortField, setSortField] = useState<"name" | "earTag" | "age">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [birthdayFrom, setBirthdayFrom] = useState<Date | null>(null);
  const [birthdayTo, setBirthdayTo] = useState<Date | null>(null);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);

  // Get unique animal types
  const animalTypes = useMemo(() => {
    return [...new Set(animals?.map((animal) => animal.type))];
  }, [animals]);

  // Filter animals: exclude dead, apply type and birthday filters
  const filteredAnimals = useMemo(() => {
    let result = animals ?? [];

    // Exclude dead animals
    result = result.filter((a) => !a.dateOfDeath);

    // Filter by type
    if (selectedTypes.size > 0) {
      result = result.filter((a) => selectedTypes.has(a.type));
    }

    // Filter by selected only
    if (showSelectedOnly) {
      result = result.filter((a) => selectedIds.has(a.id));
    }

    // Filter by birthday range
    if (birthdayFrom) {
      result = result.filter((a) => new Date(a.dateOfBirth) >= birthdayFrom);
    }
    if (birthdayTo) {
      result = result.filter((a) => new Date(a.dateOfBirth) <= birthdayTo);
    }

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
  }, [
    animals,
    selectedTypes,
    showSelectedOnly,
    selectedIds,
    birthdayFrom,
    birthdayTo,
    sortField,
    sortDir,
  ]);

  // Fuse.js search
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

  function handleConfirm() {
    navigation.popTo(
      previousScreen,
      {
        animalIds: Array.from(selectedIds),
      },
      { merge: true },
    );
  }

  function handleDateRangeApply(from: Date | null, to: Date | null) {
    setBirthdayFrom(from);
    setBirthdayTo(to);
    setShowDateRangeModal(false);
  }

  const hasDateFilter = birthdayFrom !== null || birthdayTo !== null;

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
            title={t("treatments.confirm_selection", {
              count: selectedIds.size,
            })}
            onPress={handleConfirm}
            disabled={false}
          />
        </BottomActionContainer>
      }
    >
      <H2>{t("treatments.select_animals")}</H2>

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
        contentContainerStyle={{
          gap: theme.spacing.xs,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <FilterChip
          label={t("animals.selected_only")}
          active={showSelectedOnly}
          onPress={() => setShowSelectedOnly((prev) => !prev)}
          theme={theme}
        />
        <FilterChip
          label={t("treatments.birthday_filter")}
          active={hasDateFilter}
          onPress={() => setShowDateRangeModal(true)}
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
          <Subtitle
            style={{
              textDecorationLine: "underline",
              color: theme.colors.primary,
            }}
          >
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

      <DateRangeFilterModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onApply={handleDateRangeApply}
        initialFrom={
          birthdayFrom ??
          (minMaxDateOfBirth ? new Date(minMaxDateOfBirth.min) : null)
        }
        initialTo={
          birthdayTo ??
          (minMaxDateOfBirth ? new Date(minMaxDateOfBirth.max) : null)
        }
      />
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
