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
import { ActivityIndicator, SectionList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotTillagesScreenProps } from "./navigation/plots-routes";
import { useTillagesForPlotQuery } from "../tillages/tillages.hooks";

export function PlotTillagesScreen({
  navigation,
  route,
}: PlotTillagesScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;
  const { tillages } = useTillagesForPlotQuery(plotId);

  const [searchText, setSearchText] = useState("");
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [selectedActions, setSelectedActions] = useState<Set<string>>(
    new Set(),
  );

  const availableYears = useMemo(() => {
    if (!tillages) return [];
    const years = new Set<string>();
    for (const til of tillages)
      years.add(new Date(til.date).getFullYear().toString());
    return [...years].sort((a, b) => Number(b) - Number(a));
  }, [tillages]);

  const availableActions = useMemo(() => {
    if (!tillages) return [];
    const actions = new Set<string>();
    for (const til of tillages) {
      const label =
        til.action === "custom"
          ? (til.customAction ?? t("tillages.actions.custom"))
          : t(`tillages.actions.${til.action}`);
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

  const sections = useMemo(() => {
    if (!tillages) return [];

    const sanitized = tillages.map((til) => ({
      ...til,
      formattedDate: formatLocalizedDate(
        new Date(til.date),
        locale,
        "long",
        false,
      ),
      actionLabel:
        til.action === "custom"
          ? (til.customAction ?? t("tillages.actions.custom"))
          : t(`tillages.actions.${til.action}`),
    }));

    let filtered = sanitized;
    if (selectedYears.size > 0) {
      filtered = filtered.filter((til) =>
        selectedYears.has(new Date(til.date).getFullYear().toString()),
      );
    }
    if (selectedActions.size > 0) {
      filtered = filtered.filter((til) =>
        selectedActions.has(til.actionLabel),
      );
    }
    if (searchText) {
      const fuse = new Fuse(filtered, {
        minMatchCharLength: 1,
        keys: ["formattedDate", "actionLabel"],
      });
      filtered = fuse.search(searchText).map((r) => r.item);
    }

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
            {tillage.formattedDate}
          </ListItem.Title>
          <ListItem.Body>{tillage.actionLabel}</ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [navigation],
  );

  if (!tillages) {
    return (
      <ContentView headerVisible>
        <H2>{t("tillages.tillage")}</H2>
        <H3>{t("plots.plot_name", { name })}</H3>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </ContentView>
    );
  }

  return (
    <ContentView headerVisible>
      <H2>{t("tillages.tillage")}</H2>
      <H3>{t("plots.plot_name", { name })}</H3>

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
    </ContentView>
  );
}
