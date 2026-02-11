import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H2, H3, Headline, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { round } from "@/utils/math";
import Fuse from "fuse.js";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotFertilizerApplicationsScreenProps } from "./navigation/plots-routes";
import {
  useFertilizerApplicationsForPlotQuery,
  useFertilizerApplicationSummaryForPlotQuery,
} from "../fertilizer-application/fertilizerApplications.hooks";
import { FertilizerApplicationDashboard } from "../fertilizer-application/components/FertilizerApplicationDashboard";

type ViewMode = "dashboard" | "list";

export function PlotFertilizerApplicationsScreen({
  navigation,
  route,
}: PlotFertilizerApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchText, setSearchText] = useState("");

  const { fertilizerApplications } =
    useFertilizerApplicationsForPlotQuery(plotId);
  const { applicationSummaries } =
    useFertilizerApplicationSummaryForPlotQuery(plotId);

  const availableYears = useMemo(() => {
    if (!fertilizerApplications) return [];
    const years = new Set<number>();
    for (const fa of fertilizerApplications)
      years.add(new Date(fa.date).getFullYear());
    return [...years].sort((a, b) => b - a);
  }, [fertilizerApplications]);

  // Build SectionList sections for the list view
  const sections = useMemo(() => {
    if (!fertilizerApplications) return [];
    const sanitized = fertilizerApplications.map((fa) => ({
      ...fa,
      formattedDate: formatLocalizedDate(
        new Date(fa.date),
        locale,
        "long",
        false,
      ),
    }));

    let filtered = sanitized;
    if (searchText) {
      const fuse = new Fuse(sanitized, {
        minMatchCharLength: 1,
        keys: ["formattedDate", "fertilizer.name"],
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
  }, [fertilizerApplications, searchText]);

  const renderItem = useCallback(
    ({ item: fa }: { item: (typeof sections)[number]["data"][number] }) => (
      <ListItem
        key={fa.id}
        onPress={() =>
          navigation.navigate("FertilizerApplicationDetails", {
            fertilizerApplicationId: fa.id,
          })
        }
      >
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>
            {fa.formattedDate}
          </ListItem.Title>
          <ListItem.Body>
            {round(fa.numberOfUnits * fa.amountPerUnit, 2)}
            {fa.unit} {fa.fertilizer.name}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [navigation],
  );

  if (!fertilizerApplications) return null;

  return (
    <ContentView headerVisible>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: theme.spacing.s,
        }}
      >
        <View>
          <H2>{t("fertilizer_application.fertilizer_application")}</H2>
          <H3>{t("plots.plot_name", { name })}</H3>
        </View>
        <ViewToggle mode={viewMode} onToggle={setViewMode} />
      </View>

      {viewMode === "dashboard" && (
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={t(
            "fertilizer_application.fertilizer_application",
          )}
        >
          {!applicationSummaries || applicationSummaries.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <FertilizerApplicationDashboard
              summaries={applicationSummaries}
              availableYears={availableYears}
            />
          )}
        </ScrollView>
      )}

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
        </View>
      )}
    </ContentView>
  );
}

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
