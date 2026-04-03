import { AnimalWithWaitingTimeFlag } from "@/api/animals.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { Chip } from "@/components/chips/Chip";
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
import { usePermissions } from "@/features/user/users.hooks";


// HSL-based color from string — 360 possible hues, no palette collisions
function animalTypeColor(type: string): string {
  let hash = 0;
  for (let i = 0; i < type.length; i++) hash = type.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 40%)`;
}

export function AnimalsScreen({ navigation }: AnimalsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const { animals, isLoading } = useAnimalsQuery();
  const [searchText, setSearchText] = useState("");
  const [showDead, setShowDead] = useState(false);
  const [unregisteredOnly, setUnregisteredOnly] = useState(false);
  const [onlyWithWaitingPeriod, setOnlyWithWaitingPeriod] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"name" | "earTag" | "age">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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
    if (selectedTypes.size > 0) {
      result = result.filter((a) => selectedTypes.has(a.type));
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
    showDead,
    unregisteredOnly,
    onlyWithWaitingPeriod,
    selectedTypes,
    sortField,
    sortDir,
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
    ({ item: animal }: { item: AnimalWithWaitingTimeFlag }) => {
      const birthdate = animal.dateOfBirth
        ? new Date(animal.dateOfBirth).toLocaleDateString()
        : null;
      const stripeColor = !animal.registered
        ? theme.colors.warning
        : !animal.milkAndMeatUsable
          ? theme.colors.blue
          : undefined;
      return (
        <ListItem
          key={animal.id}
          style={{
            paddingVertical: 5,
            borderLeftWidth: stripeColor ? 4 : 0,
            borderLeftColor: stripeColor,
          }}
          onPress={() => navigation.navigate("AnimalDetails", { animalId: animal.id })}
        >
          <ListItem.Content>
            <ListItem.Title numberOfLines={1}>{animal.name}</ListItem.Title>
            {animal.earTag && (
              <ListItem.Body numberOfLines={1}>{animal.earTag.number}</ListItem.Body>
            )}
          </ListItem.Content>
          <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "center", gap: theme.spacing.xs }}>
            {birthdate && (
              <Chip small label={birthdate} bgColor={theme.colors.gray4} />
            )}
            <Chip
              small
              label={t(`animals.animal_types.${animal.type}`)}
              bgColor={animalTypeColor(animal.type)}
              textColor="#fff"
            />
          </View>
          <ListItem.Chevron />
        </ListItem>
      );
    },
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
            borderLeftColor: theme.colors.warning,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
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

      {/* Toolbar: batch edit (left) + sort control (right) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: theme.spacing.m,
        }}
      >
        {animals && animals.length > 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate("BatchSelectAnimals")}>
            <MaterialCommunityIcons
              name="checkbox-multiple-marked-outline"
              size={26}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
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

      {canWrite("animals") && (
        <FAB
          icon={{ name: "add", color: "white" }}
          onPress={() => navigation.navigate("CreateAnimal")}
        />
      )}
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
