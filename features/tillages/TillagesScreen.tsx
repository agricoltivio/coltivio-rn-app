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
import { TillagesScreenProps } from "./navigation/tillages-routes";
import { useTillagesQuery } from "./tillages.hooks";

export function TillagesScreen({ navigation }: TillagesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { tillages } = useTillagesQuery();

  const [searchText, setSearchText] = useState("");
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Set<string>>(
    new Set(),
  );

  // Extract available years sorted descending
  const availableYears = useMemo(() => {
    if (!tillages) return [];
    const years = new Set<string>();
    for (const tillage of tillages) {
      years.add(new Date(tillage.date).getFullYear().toString());
    }
    return [...years].sort((a, b) => Number(b) - Number(a));
  }, [tillages]);

  // Extract unique actions with translated labels
  const availableActions = useMemo(() => {
    if (!tillages) return [];
    const actions = new Set<string>();
    for (const tillage of tillages) {
      const label =
        tillage.action === "custom"
          ? (tillage.customAction ?? t("tillages.actions.custom"))
          : t(`tillages.actions.${tillage.action}`);
      actions.add(label);
    }
    return [...actions].sort();
  }, [tillages, t]);

  function toggleYear(year: string) {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  }

  function toggleAction(action: string) {
    setSelectedActions((prev) => {
      const next = new Set(prev);
      if (next.has(action)) next.delete(action);
      else next.add(action);
      return next;
    });
  }

  // Build SectionList sections with filtering
  const sections = useMemo(() => {
    if (!tillages) return [];

    const sanitized = tillages.map((tillage) => ({
      ...tillage,
      formattedDate: formatLocalizedDate(
        new Date(tillage.date),
        locale,
        "long",
        false,
      ),
      actionLabel:
        tillage.action === "custom"
          ? (tillage.customAction ?? t("tillages.actions.custom"))
          : t(`tillages.actions.${tillage.action}`),
    }));

    // Filter by selected years
    let filtered = sanitized;
    if (selectedYears.size > 0) {
      filtered = filtered.filter((til) =>
        selectedYears.has(new Date(til.date).getFullYear().toString()),
      );
    }

    // Filter by selected actions
    if (selectedActions.size > 0) {
      filtered = filtered.filter((til) => selectedActions.has(til.actionLabel));
    }

    // Search
    if (searchText) {
      const fuse = new Fuse(filtered, {
        minMatchCharLength: 1,
        keys: ["formattedDate", "actionLabel", "plot.name"],
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
  }, [tillages, selectedYears, selectedActions, searchText, t]);

  const renderItem = useCallback(
    ({
      item: tillage,
    }: {
      item: (typeof sections)[number]["data"][number];
    }) => (
      <ListItem
        key={tillage.id}
        onPress={() =>
          navigation.navigate("TillageDetails", { tillageId: tillage.id })
        }
      >
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>
            {tillage.formattedDate} -{" "}
            {t("plots.plot_name", { name: tillage.plot.name })}
          </ListItem.Title>
          <ListItem.Body>{tillage.actionLabel}</ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [navigation, t],
  );

  if (!tillages) return null;

  return (
    <ContentView headerVisible>
      <H2>{t("tillages.tillages")}</H2>

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

      {/* Action filter chips */}
      <View style={{ marginTop: theme.spacing.xs }}>
        <FilterChips
          items={availableActions}
          selectedItems={selectedActions}
          onToggle={toggleAction}
        />
      </View>

      {sections.length === 0 ? (
        <Headline>{t("common.no_entries")}</Headline>
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
        onPress={() => navigation.navigate("SelectTillageDate")}
      />
    </ContentView>
  );
}
