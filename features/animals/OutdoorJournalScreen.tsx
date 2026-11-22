import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import {
  View,
  ScrollView as RNScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useCallback, useState } from "react";
import { useOutdoorJournalQuery } from "./outdoor-journal.hooks";
import {
  buildJournalTimelineData,
  buildMeadowJournalTimelineData,
} from "./timeline/outdoor-journal-timeline-utils";
import { ChartViewSwitcher } from "@/components/charts/ChartViewSwitcher";
import { round } from "@/utils/math";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { OutdoorJournalScreenProps } from "./navigation/animals-routes";
import {
  OutdoorBar,
  buildHerdsTimelineData,
  herdBarOnDay,
} from "./timeline/outdoor-timeline-utils";
import { OUTDOOR_TYPE_COLORS } from "./timeline/OutdoorTimelineBar";
import { useHerdsQuery } from "./herds.hooks";
import { ListItem } from "@/components/list/ListItem";

export function OutdoorJournalScreen({
  navigation,
}: OutdoorJournalScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const { data } = useOutdoorJournalQuery();

  // "categories": one row per animal category, "meadows": one row per meadow
  const [viewMode, setViewMode] = useState<"categories" | "herds" | "meadows">(
    "categories",
  );
  const { herds } = useHerdsQuery();

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedBar, setSelectedBar] = useState<OutdoorBar | null>(null);

  // Categories present in the data
  const availableCategories = useMemo(() => {
    if (!data?.entries) return [];
    return [...new Set(data.entries.map((e) => e.category))].sort();
  }, [data?.entries]);

  // Filter entries by selected categories (show all if none selected)
  const filteredEntries = useMemo(() => {
    if (!data?.entries) return [];
    if (selectedCategories.size === 0) return data.entries;
    return data.entries.filter((e) => selectedCategories.has(e.category));
  }, [data?.entries, selectedCategories]);

  const timelineData = useMemo(() => {
    if (viewMode === "meadows") {
      return buildMeadowJournalTimelineData(data?.meadowEntries ?? []);
    }
    // Per herd: its schedules with the exceptions applied, colored by type
    if (viewMode === "herds") return buildHerdsTimelineData(herds ?? []);
    return buildJournalTimelineData(filteredEntries);
  }, [viewMode, filteredEntries, data?.meadowEntries, herds]);

  // Build a lookup from scheduleId to bar for fast access on press
  const barLookup = useMemo(() => {
    const map = new Map<string, OutdoorBar>();
    for (const herd of timelineData.herds) {
      for (const bar of herd.bars) {
        map.set(bar.scheduleId, bar);
      }
    }
    return map;
  }, [timelineData]);

  function toggleCategory(category: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  const handleBarPress = useCallback(
    (scheduleId: string) => {
      const bar = barLookup.get(scheduleId);
      if (!bar) return;
      // Herd view: a bar opens its herd, the other views show the journal entry
      if (viewMode === "herds") {
        navigation.navigate("HerdEdit", { herdId: bar.herdId });
        return;
      }
      setSelectedBar(bar);
    },
    [barLookup, viewMode, navigation],
  );

  // Herds below the timeline: those with something planned today first
  const herdRows = useMemo(
    () =>
      (herds ?? [])
        .map((herd) => {
          const overrides = herd.outdoorScheduleOverrides ?? [];
          const bar = herdBarOnDay(herd.outdoorSchedules, overrides);
          const source = bar?.isOverride
            ? overrides.find((override) => override.id === bar.scheduleId)
            : herd.outdoorSchedules.find(
                (schedule) => schedule.id === bar?.scheduleId,
              );
          return { herd, bar, meadowName: source?.meadow?.name ?? null };
        })
        .sort(
          (a, b) =>
            Number(b.bar !== null) - Number(a.bar !== null) ||
            a.herd.name.localeCompare(b.herd.name),
        ),
    [herds],
  );

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.outdoor_journal")}
      >
        <H2>{t("animals.outdoor_journal")}</H2>

        <View style={{ marginTop: theme.spacing.s }}>
          <ChartViewSwitcher
            value={viewMode}
            onChange={setViewMode}
            options={[
              {
                key: "categories",
                label: t("animals.meadows.journal_view_categories"),
              },
              { key: "herds", label: t("animals.herds") },
              { key: "meadows", label: t("animals.meadows.meadows") },
            ]}
          />
        </View>

        {/* Category filter chips */}
        {viewMode === "categories" && availableCategories.length > 0 && (
          <RNScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: theme.spacing.s, flexGrow: 0 }}
            contentContainerStyle={{ gap: theme.spacing.xs }}
          >
            {availableCategories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => toggleCategory(category)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: selectedCategories.has(category)
                    ? theme.colors.primary
                    : theme.colors.white,
                  borderWidth: 1,
                  borderColor: selectedCategories.has(category)
                    ? theme.colors.primary
                    : theme.colors.gray3,
                }}
              >
                <Subtitle
                  style={{
                    color: selectedCategories.has(category)
                      ? theme.colors.white
                      : theme.colors.gray1,
                    fontSize: 14,
                  }}
                >
                  {category}
                </Subtitle>
              </TouchableOpacity>
            ))}
          </RNScrollView>
        )}

        {/* Warning banner for uncategorized animals */}
        {data && data.uncategorizedAnimals.length > 0 && (
          <View
            style={{
              marginTop: theme.spacing.s,
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
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.warning}
            />
            <Subtitle style={{ flex: 1 }}>
              {t("animals.uncategorized_animals_warning", {
                count: data.uncategorizedAnimals.length,
              })}
            </Subtitle>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UncategorizedAnimals", {
                  animals: data.uncategorizedAnimals,
                })
              }
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: theme.colors.primary,
              }}
            >
              <Subtitle style={{ color: theme.colors.white, fontSize: 13 }}>
                {t("animals.show_animals")}
              </Subtitle>
            </TouchableOpacity>
          </View>
        )}

        {/* As tall as its rows, so the herds below stay in view */}
        <View style={{ marginTop: theme.spacing.m }}>
          <OutdoorScheduleTimeline
            timelineData={timelineData}
            onBarPress={handleBarPress}
            fitContent
          />
        </View>

        {/* Herds with what they do today (exceptions applied); tapping opens the herd */}
        <View style={{ marginTop: theme.spacing.l }}>
          <H3 style={{ marginBottom: theme.spacing.s }}>
            {t("animals.herds")}
          </H3>
          {herdRows.length === 0 ? (
            <Subtitle>{t("animals.no_herds")}</Subtitle>
          ) : (
            <View
              style={{
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
              }}
            >
              {herdRows.map(({ herd, bar, meadowName }) => (
                <ListItem
                  key={herd.id}
                  style={{ paddingVertical: 5 }}
                  onPress={() =>
                    navigation.navigate("HerdEdit", { herdId: herd.id })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title>{herd.name}</ListItem.Title>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {bar?.scheduleType && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor:
                              OUTDOOR_TYPE_COLORS[bar.scheduleType],
                            borderWidth: bar.isOverride ? 1.5 : 0,
                            borderColor: theme.colors.gray0,
                          }}
                        />
                      )}
                      <ListItem.Body>
                        {[
                          // e.g. "Today: Stable (Exception)"
                          `${t("crop_rotations.timeline.today")}: ${
                            bar?.scheduleType
                              ? t(`animals.outdoor_types.${bar.scheduleType}`)
                              : "–"
                          }${
                            bar?.isOverride
                              ? ` (${t("animals.outdoor_override_single")})`
                              : ""
                          }`,
                          meadowName,
                          t("animals.herd_animal_count", {
                            count: herd.animals.length,
                          }),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </ListItem.Body>
                    </View>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Journal entry detail modal */}
      <Modal
        visible={selectedBar != null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBar(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.m,
          }}
          onPress={() => setSelectedBar(null)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 16,
              padding: theme.spacing.l,
              width: "100%",
              maxWidth: 320,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedBar && (
              <>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: theme.colors.text,
                    marginBottom: theme.spacing.m,
                  }}
                >
                  {selectedBar.meadowName
                    ? selectedBar.herdName
                    : `${t("animals.category")} ${selectedBar.herdName}`}
                </Text>

                <View style={{ gap: theme.spacing.s }}>
                  {/* Meadow and type (meadow view only) */}
                  {selectedBar.meadowName && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
                        {t("animals.meadows.meadow")}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: theme.colors.text,
                        }}
                      >
                        {selectedBar.meadowName}
                        {selectedBar.meadowSize !== undefined
                          ? ` (${round(selectedBar.meadowSize / 100, 1)}a)`
                          : ""}
                      </Text>
                    </View>
                  )}
                  {selectedBar.meadowName && selectedBar.scheduleType && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
                        {t("animals.outdoor_type")}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: theme.colors.text,
                        }}
                      >
                        {t(`animals.outdoor_types.${selectedBar.scheduleType}`)}
                      </Text>
                    </View>
                  )}
                  {/* Animal count */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
                      {t("animals.animals")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {selectedBar.animalCount ?? "–"}
                    </Text>
                  </View>

                  {/* Date range */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
                      {t("animals.start_date")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {selectedBar.startDate
                        ? formatLocalizedDate(
                            new Date(selectedBar.startDate),
                            locale,
                          )
                        : "–"}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
                      {t("animals.end_date")}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: theme.colors.text,
                      }}
                    >
                      {selectedBar.endDate
                        ? formatLocalizedDate(
                            new Date(selectedBar.endDate),
                            locale,
                          )
                        : "–"}
                    </Text>
                  </View>
                </View>

                {/* Close button */}
                <Pressable
                  onPress={() => setSelectedBar(null)}
                  style={{
                    marginTop: theme.spacing.l,
                    paddingVertical: 12,
                    backgroundColor: theme.colors.gray5,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: theme.colors.gray1,
                    }}
                  >
                    {t("buttons.close")}
                  </Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ContentView>
  );
}
