import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H2, H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, SectionList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { HarvestDashboard } from "./components/HarvestDashboard";
import {
  useHarvestSummariesOfFarm,
  useHarvestsQuery,
} from "./harvests.hooks";
import { HarvestsScreenProps } from "./navigation/harvest-routes";

type ViewMode = "dashboard" | "list";

export function HarvestsScreen({ navigation }: HarvestsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchText, setSearchText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return navigation.addListener("transitionEnd", (e) => {
      if (!e.data.closing) setReady(true);
    });
  }, [navigation]);

  const { harvestSummaries, isLoading: summariesLoading } = useHarvestSummariesOfFarm();
  const { harvests, isLoading: harvestsLoading } = useHarvestsQuery(undefined, undefined, viewMode === "list");

  // Group harvests by year for SectionList
  const sections = useMemo(() => {
    if (!harvests) return [];
    const sanitized = harvests.map(
      ({ date, unit, conservationMethod, crop, ...rest }) => ({
        date: formatLocalizedDate(new Date(date), locale, "long", false),
        rawDate: date,
        unit: t(`harvests.labels.unit.${unit}`),
        conservationMethod: conservationMethod
          ? t(`harvests.labels.conservation_method.${conservationMethod}`)
          : undefined,
        cropName: crop.name,
        ...rest,
      }),
    );

    let filtered = sanitized;
    if (searchText) {
      const fuse = new Fuse(sanitized, {
        minMatchCharLength: 1,
        keys: ["date", "unit", "conservationMethod", "cropName", "plot.name"],
      });
      filtered = fuse.search(searchText).map((r) => r.item);
    }

    // Group by year descending
    const grouped: Record<number, typeof filtered> = {};
    for (const item of filtered) {
      const year = new Date(item.rawDate).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(item);
    }
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({ title: year.toString(), data: grouped[year] }));
  }, [harvests, searchText, t]);

  return (
    <ContentView headerVisible>
      {/* Header row: title on left, view toggle on right */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: theme.spacing.s,
        }}
      >
        <H2>{t("harvests.harvest")}</H2>
        <ViewToggle mode={viewMode} onToggle={setViewMode} />
      </View>

      {/* Dashboard view */}
      {viewMode === "dashboard" && (
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={t("harvests.harvest")}
        >
          {!ready || summariesLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : !harvestSummaries || harvestSummaries.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <HarvestDashboard
              harvestSummaries={harvestSummaries}
            />
          )}
        </ScrollView>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <View style={{ flex: 1 }}>
          <View style={{ marginBottom: theme.spacing.m }}>
            <TextInput
              hideLabel
              placeholder={t("forms.placeholders.search")}
              onChangeText={setSearchText}
              value={searchText}
            />
          </View>
          {harvestsLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : sections.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <SectionList
              stickySectionHeadersEnabled={false}
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
              renderItem={({ item: harvest }) => (
                <ListItem
                  key={harvest.id}
                  onPress={() =>
                    navigation.navigate("HarvestDetails", {
                      harvestId: harvest.id,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ flex: 1 }}>
                      {t("plots.plot_name_date", {
                        name: harvest.plot.name,
                        date: harvest.date,
                      })}
                    </ListItem.Title>
                    <ListItem.Body>
                      {round(harvest.numberOfUnits * harvest.kilosPerUnit, 2)}
                      kg, {harvest.cropName}, {harvest.unit},{" "}
                      {harvest.conservationMethod}
                    </ListItem.Body>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              )}
            />
          )}
        </View>
      )}

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("SelectHarvestCropAndDate")}
      />
    </ContentView>
  );
}

/** Segmented toggle button for dashboard/list */
function ViewToggle({
  mode,
  onToggle,
}: {
  mode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.gray3,
        overflow: "hidden",
      }}
    >
      <TouchableOpacity
        onPress={() => onToggle("dashboard")}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor:
            mode === "dashboard" ? theme.colors.primary : theme.colors.white,
        }}
      >
        <Subtitle
          style={{
            fontSize: 18,
            color: mode === "dashboard" ? "#fff" : theme.colors.gray2,
          }}
        >
          {"\u25A6"}
        </Subtitle>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onToggle("list")}
        style={{
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor:
            mode === "list" ? theme.colors.primary : theme.colors.white,
        }}
      >
        <Subtitle
          style={{
            fontSize: 18,
            color: mode === "list" ? "#fff" : theme.colors.gray2,
          }}
        >
          {"\u2630"}
        </Subtitle>
      </TouchableOpacity>
    </View>
  );
}
