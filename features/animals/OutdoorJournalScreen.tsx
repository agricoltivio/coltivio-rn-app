import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import {
  View,
  ScrollView as RNScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useCallback, useState } from "react";
import { useOutdoorJournalQuery } from "./outdoor-journal.hooks";
import { buildJournalTimelineData } from "./timeline/outdoor-journal-timeline-utils";
import { OutdoorScheduleTimeline } from "./timeline/OutdoorScheduleTimeline";
import { OutdoorJournalScreenProps } from "./navigation/animals-routes";

export function OutdoorJournalScreen({ navigation }: OutdoorJournalScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useOutdoorJournalQuery();

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

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

  const handleBarPress = useCallback(() => {
    // no-op for journal bars
  }, []);

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

        {/* Warning banner for uncategorized animals */}
        {data && data.uncategorizedAnimalCount > 0 && (
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
              {t("animals.uncategorized_animals_warning", {
                count: data.uncategorizedAnimalCount,
              })}
            </Subtitle>
          </View>
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
          <Ionicons name="information-circle" size={20} color={theme.colors.blue} />
          <Subtitle style={{ flex: 1 }}>
            {t("animals.outdoor_journal_info")}
          </Subtitle>
        </View>

        <View style={{ marginTop: theme.spacing.m, flex: 1, minHeight: 400 }}>
          <OutdoorScheduleTimeline
            timelineData={timelineData}
            onBarPress={handleBarPress}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
