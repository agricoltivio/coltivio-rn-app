import { WikiMyEntry } from "@/api/wiki.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { FilterChips } from "@/components/filters/FilterChips";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2, H3 } from "@/theme/Typography";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, SectionList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMyWikiEntriesQuery } from "./wiki.hooks";
import { WikiListScreenProps } from "./navigation/wiki-routes";

// Find the translation for the current locale, falling back to "de"
function findTranslation<T extends { locale: string }>(
  translations: T[],
  currentLocale: string,
): T | undefined {
  return (
    translations.find((t) => t.locale === currentLocale) ??
    translations.find((t) => t.locale === "de")
  );
}

type Section = {
  title: string;
  data: WikiMyEntry[];
};

export function WikiListScreen({ navigation }: WikiListScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const { localSettings } = useLocalSettings();

  useEffect(() => {
    if (!localSettings.wikiOnboardingCompleted) {
      navigation.navigate("WikiOnboarding");
    }
  }, []);

  const { myEntries, isLoading } = useMyWikiEntriesQuery();

  const sections = useMemo((): Section[] => {
    if (!myEntries) return [];

    // Client-side search filter by title
    const searchFiltered = searchText
      ? myEntries.filter((entry) => {
          const translation = findTranslation(entry.translations, locale);
          return translation?.title
            .toLowerCase()
            .includes(searchText.toLowerCase());
        })
      : myEntries;

    // Category chip filter
    const filtered =
      selectedCategories.size > 0
        ? searchFiltered.filter((entry) => {
            const categoryTranslation = findTranslation(
              entry.category.translations,
              locale,
            );
            const categoryName =
              categoryTranslation?.name ?? entry.category.slug;
            return selectedCategories.has(categoryName);
          })
        : searchFiltered;

    // Group by category name in current locale
    const grouped: Record<string, WikiMyEntry[]> = {};
    for (const entry of filtered) {
      const categoryTranslation = findTranslation(
        entry.category.translations,
        locale,
      );
      const categoryName = categoryTranslation?.name ?? entry.category.slug;
      if (!grouped[categoryName]) grouped[categoryName] = [];
      grouped[categoryName].push(entry);
    }

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((title) => ({ title, data: grouped[title] }));
  }, [myEntries, searchText, selectedCategories, locale]);

  // Collect all unique category names from the entry set for the chips
  const allCategories = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const entry of myEntries ?? []) {
      const name =
        findTranslation(entry.category.translations, locale)?.name ??
        entry.category.slug;
      if (!seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
    return names.sort((a, b) => a.localeCompare(b));
  }, [myEntries, locale]);

  return (
    <ContentView headerVisible>
      <H2>{t("wiki.wiki")}</H2>

      <View
        style={{ marginTop: theme.spacing.m, marginBottom: theme.spacing.s }}
      >
        <TextInput
          hideLabel
          placeholder={t("forms.placeholders.search")}
          onChangeText={setSearchText}
          value={searchText}
        />
        <View style={{ marginTop: theme.spacing.s }}>
          <FilterChips
            items={allCategories}
            selectedItems={selectedCategories}
            onToggle={(name) =>
              setSelectedCategories((prev) => {
                const next = new Set(prev);
                next.has(name) ? next.delete(name) : next.add(name);
                return next;
              })
            }
          />
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              overflow: "hidden",
            }}
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
            renderItem={({ item }) => {
              const translation = findTranslation(item.translations, locale);
              const displayTitle = translation?.title ?? "";
              return (
                <ListItem
                  onPress={() =>
                    navigation.navigate("WikiDetail", { entryId: item.id })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title numberOfLines={1}>
                      {displayTitle}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              );
            }}
            ListEmptyComponent={
              <ListItem.Body style={{ marginTop: theme.spacing.l }}>
                {t("common.no_entries")}
              </ListItem.Body>
            }
          />
        </View>
      )}

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("WikiEntryForm", {})}
      />
    </ContentView>
  );
}
