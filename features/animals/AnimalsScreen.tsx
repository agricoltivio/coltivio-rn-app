import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2, Subtitle } from "@/theme/Typography";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { AnimalsScreenProps } from "./navigation/animals-routes";

export function AnimalsScreen({ navigation }: AnimalsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animals, isLoading } = useAnimalsQuery();
  const [searchText, setSearchText] = useState("");
  const [showDead, setShowDead] = useState(false);
  const [unregisteredOnly, setUnregisteredOnly] = useState(false);
  const [onlyWithWaitingPeriod, setOnlyWithWaitingPeriod] = useState(false);
  const [onlyWithoutCategory, setOnlyWithoutCategory] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  // Count unregistered animals (only among living animals by default)
  const unregisteredCount = useMemo(() => {
    if (!animals) return 0;
    return animals.filter((a) => !a.registered && !a.dateOfDeath).length;
  }, [animals]);

  // Count animals with active waiting period (Absetzfrist)
  const waitingPeriodCount = useMemo(() => {
    if (!animals) return 0;
    return animals.filter((a) => !a.milkAndMeatUsable && !a.dateOfDeath).length;
  }, [animals]);

  // Count animals without category
  const withoutCategoryCount = useMemo(() => {
    if (!animals) return 0;
    return animals.filter((a) => a.requiresCategoryOverride && !a.dateOfDeath)
      .length;
  }, [animals]);

  // Apply filters: dead, unregistered, type
  const filteredAnimals = useMemo(() => {
    if (!animals) return [];
    let result = animals;

    // By default, hide dead animals unless showDead is on
    if (!showDead) {
      result = result.filter((a) => !a.dateOfDeath);
    }

    if (unregisteredOnly) {
      result = result.filter((a) => !a.registered);
    }
    if (onlyWithWaitingPeriod) {
      result = result.filter((a) => !a.milkAndMeatUsable);
    }
    if (onlyWithoutCategory) {
      result = result.filter((a) => a.requiresCategoryOverride);
    }

    if (selectedTypes.size > 0) {
      result = result.filter((a) => selectedTypes.has(a.type));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [
    animals,
    showDead,
    unregisteredOnly,
    onlyWithWaitingPeriod,
    onlyWithoutCategory,
    selectedTypes,
  ]);

  const animalTypes = useMemo(() => {
    return [...new Set(animals?.map((animal) => animal.type))];
  }, [animals]);
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

  const renderItem = useCallback(
    ({ item: animal }: { item: AnimalWithWaitingTimeFlag }) => (
      <ListItem
        key={animal.id}
        style={{ paddingVertical: 5 }}
        onPress={() =>
          navigation.navigate("AnimalDetails", {
            animalId: animal.id,
          })
        }
      >
        <ListItem.Content>
          <ListItem.Title>{animal.name}</ListItem.Title>
          <ListItem.Body>
            {t(`animals.animal_types.${animal.type}`)}
            {animal.earTag ? ` - ${animal.earTag.number}` : ""}
          </ListItem.Body>
        </ListItem.Content>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xxs,
          }}
        >
          {!animal.milkAndMeatUsable && (
            <Ionicons name="time" size={22} color={theme.colors.blue} />
          )}
          {(!animal.registered || animal.requiresCategoryOverride) && (
            <Ionicons
              name="alert-circle"
              size={22}
              color={theme.colors.yellow}
            />
          )}
        </View>
        <ListItem.Chevron />
      </ListItem>
    ),
    [t, navigation, theme],
  );

  return (
    <ContentView headerVisible>
      <H2>{t("animals.animals")}</H2>

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
        {animalTypes?.map((animalType) => (
          <FilterChip
            key={animalType}
            label={t(`animals.animal_types.${animalType}`)}
            active={selectedTypes.has(animalType)}
            onPress={() => toggleType(animalType)}
            theme={theme}
          />
        ))}
        <FilterChip
          label={t("animals.only_with_waiting_period")}
          active={onlyWithWaitingPeriod}
          onPress={() => setOnlyWithWaitingPeriod(!onlyWithWaitingPeriod)}
          theme={theme}
        />
        <FilterChip
          label={t("animals.only_without_cateogry")}
          active={onlyWithoutCategory}
          onPress={() => setOnlyWithoutCategory(!onlyWithoutCategory)}
          theme={theme}
        />
        <FilterChip
          label={t("animals.only_unregistered")}
          active={unregisteredOnly}
          onPress={() => setUnregisteredOnly(!unregisteredOnly)}
          theme={theme}
        />
        <FilterChip
          label={t("animals.show_dead")}
          active={showDead}
          onPress={() => setShowDead(!showDead)}
          theme={theme}
        />
      </RNScrollView>

      {/* Unregistered animals warning card */}
      {unregisteredCount > 0 ? (
        <View
          style={{
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.yellow,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <Ionicons name="alert-circle" size={20} color={theme.colors.yellow} />
          <Subtitle>
            {t("animals.unregistered_count", { count: unregisteredCount })}
          </Subtitle>
        </View>
      ) : null}

      {/* Waiting period (Absetzfrist) warning card */}
      {waitingPeriodCount > 0 ? (
        <View
          style={{
            marginTop: theme.spacing.xs,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.blue,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <Ionicons name="time" size={20} color={theme.colors.blue} />
          <Subtitle>
            {t("animals.waiting_period_count", { count: waitingPeriodCount })}
          </Subtitle>
        </View>
      ) : null}

      {withoutCategoryCount > 0 ? (
        <View
          style={{
            marginTop: theme.spacing.m,
            backgroundColor: theme.colors.white,
            borderRadius: 10,
            padding: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.yellow,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <Ionicons name="alert-circle" size={20} color={theme.colors.yellow} />
          <Subtitle>
            {t("animals.without_category_count", {
              count: withoutCategoryCount,
            })}
          </Subtitle>
        </View>
      ) : null}

      {/* Batch edit button */}
      {animals && animals.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("BatchSelectAnimals")}
          style={{ marginTop: theme.spacing.m }}
        >
          <MaterialCommunityIcons
            name="checkbox-multiple-marked-outline"
            size={26}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      )}

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

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("CreateAnimal")}
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
