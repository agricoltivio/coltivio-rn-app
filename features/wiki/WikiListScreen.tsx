import { WikiEntry, WikiMyEntry } from "@/api/wiki.api";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { FilterChips } from "@/components/filters/FilterChips";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, SectionList, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useMyChangeRequestsQuery,
  useMyWikiEntriesQuery,
  usePublicWikiQuery,
} from "./wiki.hooks";
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

type MergedEntry = (WikiEntry | WikiMyEntry) & { isPrivate: boolean };

type Section = {
  title: string;
  data: MergedEntry[];
};

export function WikiListScreen({ navigation }: WikiListScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const { localSettings } = useLocalSettings();
  const onlyPrivate = localSettings.wikiOnlyPrivate;

  useEffect(() => {
    if (!localSettings.wikiOnboardingCompleted) {
      navigation.navigate("WikiOnboarding");
    }
  }, []);

  const { entries: publicEntries, isLoading: publicLoading } =
    usePublicWikiQuery();
  const { myEntries, isLoading: myLoading } = useMyWikiEntriesQuery();
  const { changeRequests } = useMyChangeRequestsQuery();

  // Entries with in-flight status (submitted / under_review)
  const pendingEntries = useMemo(
    () =>
      (myEntries ?? []).filter(
        (e) => e.status === "submitted" || e.status === "under_review",
      ),
    [myEntries],
  );

  // Change requests that are draft (need action) or under_review
  const pendingChangeRequests = useMemo(
    () =>
      changeRequests.filter(
        (cr) => cr.status === "draft" || cr.status === "under_review",
      ),
    [changeRequests],
  );

  const hasPendingSection =
    pendingEntries.length > 0 || pendingChangeRequests.length > 0;

  const sections = useMemo((): Section[] => {
    if (!publicEntries && !myEntries) return [];

    // Merge public + my entries, deduplicating by id
    const seenIds = new Set<string>();
    const merged: MergedEntry[] = [];

    for (const entry of publicEntries ?? []) {
      seenIds.add(entry.id);
      merged.push({ ...entry, isPrivate: false });
    }
    for (const entry of myEntries ?? []) {
      if (!seenIds.has(entry.id)) {
        merged.push({ ...entry, isPrivate: entry.visibility === "private" });
      }
    }

    // When toggle is on, show only private entries
    const visibilityFiltered = onlyPrivate
      ? merged.filter((e) => e.isPrivate)
      : merged;

    // Client-side search filter by title
    const searchFiltered = searchText
      ? visibilityFiltered.filter((entry) => {
          const translation = findTranslation(entry.translations, locale);
          return translation?.title
            .toLowerCase()
            .includes(searchText.toLowerCase());
        })
      : visibilityFiltered;

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
    const grouped: Record<string, MergedEntry[]> = {};
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
  }, [publicEntries, myEntries, searchText, onlyPrivate, selectedCategories]);

  const isLoading = publicLoading || myLoading;

  // Collect all unique category names from the merged entry set for the chips
  const allCategories = useMemo(() => {
    const allEntries = [...(publicEntries ?? []), ...(myEntries ?? [])];
    const seen = new Set<string>();
    const names: string[] = [];
    for (const entry of allEntries) {
      const name =
        findTranslation(entry.category.translations, locale)?.name ??
        entry.category.slug;
      if (!seen.has(name)) {
        seen.add(name);
        names.push(name);
      }
    }
    return names.sort((a, b) => a.localeCompare(b));
  }, [publicEntries, myEntries]);

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
            ListHeaderComponent={
              hasPendingSection ? (
                <View style={{ marginBottom: theme.spacing.m }}>
                  <View
                    style={{
                      paddingVertical: theme.spacing.s,
                      paddingHorizontal: theme.spacing.xs,
                    }}
                  >
                    <H3>{t("wiki.pending_section")}</H3>
                  </View>
                  <View
                    style={{
                      borderTopRightRadius: 10,
                      borderTopLeftRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {pendingEntries.map((entry) => {
                      const translation = findTranslation(
                        entry.translations,
                        locale,
                      );
                      return (
                        <ListItem
                          key={entry.id}
                          onPress={() =>
                            navigation.navigate("WikiDetail", {
                              entryId: entry.id,
                            })
                          }
                        >
                          <ListItem.Content>
                            <ListItem.Title>
                              {translation?.title ?? ""}
                            </ListItem.Title>
                          </ListItem.Content>
                          <StatusBadge status={entry.status} theme={theme} />
                          <ListItem.Chevron />
                        </ListItem>
                      );
                    })}
                    {pendingChangeRequests.map((cr) => {
                      const translation = findTranslation(
                        cr.translations,
                        locale,
                      );
                      return (
                        <ListItem
                          key={cr.id}
                          onPress={() =>
                            navigation.navigate("WikiChangeRequestDraft", {
                              changeRequestId: cr.id,
                            })
                          }
                        >
                          <ListItem.Content>
                            <ListItem.Title>
                              {translation?.title ?? ""}
                            </ListItem.Title>
                          </ListItem.Content>
                          <StatusBadge status={cr.status} theme={theme} />
                          <ListItem.Chevron />
                        </ListItem>
                      );
                    })}
                  </View>
                </View>
              ) : null
            }
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
              const entryTitle = translation?.title ?? "";
              const displayTitle =
                item.isPrivate && !onlyPrivate
                  ? `${entryTitle} (Privat)`
                  : entryTitle;
              return (
                <ListItem
                  onPress={() =>
                    navigation.navigate("WikiDetail", { entryId: item.id })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{displayTitle}</ListItem.Title>
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

type StatusBadgeProps = {
  status: string;
  theme: ReturnType<typeof useTheme>;
};

function StatusBadge({ status, theme }: StatusBadgeProps) {
  const { t } = useTranslation();
  const bgColor =
    status === "draft"
      ? theme.colors.amber
      : status === "submitted" || status === "under_review"
        ? theme.colors.blue
        : theme.colors.gray4;

  const statusLabels: Record<string, string> = {
    draft: t("wiki.changes_requested"),
    submitted: t("wiki.status.submitted"),
    under_review: t("wiki.status.under_review"),
    published: t("wiki.status.published"),
    rejected: t("wiki.status.rejected"),
  };
  const label = statusLabels[status] ?? status;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: theme.radii.s,
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xxs,
        marginRight: theme.spacing.xs,
      }}
    >
      <Subtitle style={{ color: theme.colors.white, fontSize: 11 }}>
        {label}
      </Subtitle>
    </View>
  );
}
