import { Treatment } from "@/api/treatments.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { FilterChips } from "@/components/filters/FilterChips";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { H2, H3, Headline } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useTreatmentsQuery } from "./treatments.hooks";
import { TreatmentsScreenProps } from "./navigation/animals-routes";

export function TreatmentsScreen({ navigation }: TreatmentsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { treatments } = useTreatmentsQuery();

  const [searchText, setSearchText] = useState("");
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());

  // Extract available years sorted descending
  const availableYears = useMemo(() => {
    if (!treatments) return [];
    const years = new Set<string>();
    for (const treatment of treatments) {
      years.add(new Date(treatment.date).getFullYear().toString());
    }
    return [...years].sort((a, b) => Number(b) - Number(a));
  }, [treatments]);

  function toggleYear(year: string) {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  // Build SectionList sections with filtering
  const sections = useMemo(() => {
    if (!treatments) return [];

    const sanitized = treatments.map((tr) => ({
      ...tr,
      formattedDate: formatLocalizedDate(
        new Date(tr.date),
        locale,
        "long",
        false,
      ),
      animalDisplay:
        tr.animals.length === 1
          ? tr.animals[0].name
          : tr.animals.length > 1
            ? `${tr.animals.length} ${t("animals.animals")}`
            : "",
    }));

    // Filter by selected years
    let filtered = sanitized;
    if (selectedYears.size > 0) {
      filtered = filtered.filter((tr) =>
        selectedYears.has(new Date(tr.date).getFullYear().toString()),
      );
    }

    // Search
    if (searchText) {
      const fuse = new Fuse(filtered, {
        minMatchCharLength: 1,
        keys: ["formattedDate", "name", "animalDisplay", "notes"],
      });
      filtered = fuse.search(searchText).map((r) => r.item);
    }

    // Group by year
    const grouped: Record<number, typeof filtered> = {};
    for (const item of filtered) {
      const year = new Date(item.date).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(item);
    }
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({ title: year.toString(), data: grouped[year] }));
  }, [treatments, selectedYears, searchText, t]);

  const renderItem = useCallback(
    ({ item: tr }: { item: (typeof sections)[number]["data"][number] }) => (
      <ListItem
        key={tr.id}
        onPress={() =>
          navigation.navigate("EditTreatment", { treatmentId: tr.id })
        }
      >
        <ListItem.Content>
          <ListItem.Title>
            {tr.formattedDate} · {tr.animalDisplay}
          </ListItem.Title>
          <ListItem.Body>{tr.name}</ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [navigation],
  );

  if (!treatments) return null;

  return (
    <ContentView headerVisible>
      <H2>{t("treatments.treatments")}</H2>

      {/* Search */}
      <View style={{ marginTop: theme.spacing.m }}>
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
      </View>
      {/* Year filter chips */}
      <View style={{ marginTop: theme.spacing.s }}>
        <FilterChips
          items={availableYears}
          selectedItems={selectedYears}
          onToggle={toggleYear}
        />
      </View>

      {sections.length === 0 ? (
        <Headline>{t("treatments.no_treatments")}</Headline>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                paddingVertical: theme.spacing.s,
                paddingHorizontal: theme.spacing.xs,
                marginTop: theme.spacing.m,
              }}
            >
              <H3>{title}</H3>
            </View>
          )}
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
          }}
          renderItem={renderItem}
        />
      )}

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("CreateTreatment", {})}
      />
    </ContentView>
  );
}
