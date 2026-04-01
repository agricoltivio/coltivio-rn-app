import { ContentView } from "@/components/containers/ContentView";
import { FilterChips } from "@/components/filters/FilterChips";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { locale } from "@/locales/i18n";
import { H2 } from "@/theme/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useMyChangeRequestsQuery } from "./wiki.hooks";
import { WikiMySubmissionsScreenProps } from "./navigation/wiki-routes";
import { WikiStatusBadge } from "./components/WikiStatusBadge";

type StatusFilter = "active" | "resolved" | "all";

const ACTIVE_STATUSES = new Set(["draft", "under_review", "changes_requested"]);
const RESOLVED_STATUSES = new Set(["approved", "rejected"]);

function findTranslation<T extends { locale: string }>(
  translations: T[],
  currentLocale: string,
): T | undefined {
  return (
    translations.find((t) => t.locale === currentLocale) ??
    translations.find((t) => t.locale === "de")
  );
}

export function WikiMySubmissionsScreen({
  navigation,
}: WikiMySubmissionsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { changeRequests, isLoading } = useMyChangeRequestsQuery();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const [filter, setFilter] = useState<StatusFilter>("active");

  // Mark all current CR statuses as seen when this screen is opened
  useEffect(() => {
    if (changeRequests.length === 0) return;
    const snapshot: Record<string, string> = {};
    for (const cr of changeRequests) {
      snapshot[cr.id] = cr.status;
    }
    updateLocalSettings("wikiSeenCrStatuses", {
      ...localSettings.wikiSeenCrStatuses,
      ...snapshot,
    });
  }, [changeRequests]);

  const filterLabels: Record<StatusFilter, string> = {
    all: t("wiki.submissions_filter_all"),
    active: t("wiki.submissions_filter_active"),
    resolved: t("wiki.submissions_filter_resolved"),
  };

  const filtered = useMemo(() => {
    if (filter === "active") return changeRequests.filter((cr) => ACTIVE_STATUSES.has(cr.status));
    if (filter === "resolved") return changeRequests.filter((cr) => RESOLVED_STATUSES.has(cr.status));
    return changeRequests;
  }, [changeRequests, filter]);

  return (
    <ContentView headerVisible>
      <ScrollView>
        <H2>{t("wiki.my_submissions")}</H2>
        <View style={{ marginTop: theme.spacing.m, marginBottom: theme.spacing.s }}>
          <FilterChips
            items={(["active", "resolved", "all"] as StatusFilter[]).map(
              (f) => filterLabels[f],
            )}
            selectedItems={new Set([filterLabels[filter]])}
            onToggle={(label) => {
              const found = (Object.keys(filterLabels) as StatusFilter[]).find(
                (k) => filterLabels[k] === label,
              );
              if (found) setFilter(found);
            }}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" />
        ) : filtered.length === 0 ? (
          <ListItem.Body style={{ marginTop: theme.spacing.l }}>
            {t("common.no_entries")}
          </ListItem.Body>
        ) : (
          <View
            style={{
              borderRadius: theme.radii.m,
              overflow: "hidden",
              marginTop: theme.spacing.s,
            }}
          >
            {filtered.map((cr) => {
              const translation = findTranslation(cr.translations, locale);
              const isUnseen =
                cr.status !== localSettings.wikiSeenCrStatuses[cr.id];
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
                    <ListItem.Title numberOfLines={1}>
                      {translation?.title ?? ""}
                    </ListItem.Title>
                  </ListItem.Content>
                  <WikiStatusBadge status={cr.status} />
                  {isUnseen && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.colors.amber,
                        marginRight: theme.spacing.xs,
                      }}
                    />
                  )}
                  <ListItem.Chevron />
                </ListItem>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ContentView>
  );
}
