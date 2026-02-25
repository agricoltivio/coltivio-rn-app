import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import {
  View,
  ScrollView as RNScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Text,
} from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useCallback, useState } from "react";
import { useOutdoorJournalQuery } from "./outdoor-journal.hooks";
import { buildJournalTimelineData } from "./timeline/outdoor-journal-timeline-utils";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { OutdoorJournalScreenProps } from "./navigation/animals-routes";
import { OutdoorBar } from "./timeline/outdoor-timeline-utils";

export function OutdoorJournalScreen({
  navigation,
}: OutdoorJournalScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language;
  const { data } = useOutdoorJournalQuery();
  console.log(data?.uncategorizedAnimals.length);

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

  const timelineData = useMemo(
    () => buildJournalTimelineData(filteredEntries),
    [filteredEntries],
  );

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
      if (bar) setSelectedBar(bar);
    },
    [barLookup],
  );

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.outdoor_journal")}
      >
        <H2>{t("animals.outdoor_journal")}</H2>

        {/* Category filter chips */}
        {availableCategories.length > 0 && (
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

        {/* Info banner */}
        <View
          style={{
            marginTop: theme.spacing.m,
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
          <Ionicons
            name="information-circle"
            size={20}
            color={theme.colors.blue}
          />
          <Subtitle style={{ flex: 1 }}>
            {t("animals.outdoor_journal_info")}
          </Subtitle>
        </View>

        {/* Warning banner for uncategorized animals */}
        {data && data.uncategorizedAnimals.length > 0 && (
          <View
            style={{
              marginTop: theme.spacing.s,
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
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.yellow}
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

        <View style={{ marginTop: theme.spacing.m, flex: 1, minHeight: 400 }}>
          <OutdoorScheduleTimeline
            timelineData={timelineData}
            onBarPress={handleBarPress}
          />
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
                  {t("animals.category")} {selectedBar.herdName}
                </Text>

                <View style={{ gap: theme.spacing.s }}>
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
