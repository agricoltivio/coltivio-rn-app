import { FertilizerApplication } from "@/api/fertilizerApplications.api";
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
import { ActivityIndicator, InteractionManager, SectionList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { FertilizerApplicationDashboard } from "./components/FertilizerApplicationDashboard";
import {
  useFertilizerApplicationSummaryOfFarmQuery,
  useFertilizerApplicationYearsQuery,
  useFertilizerApplicationsQuery,
} from "./fertilizerApplications.hooks";
import { FertilizerApplicationsScreenProps } from "./navigation/fertilizer-application-routes";

type ViewMode = "dashboard" | "list";

export function FertilizerApplicationsScreen({
  navigation,
}: FertilizerApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchText, setSearchText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  const { fertilizerApplicationYears } =
    useFertilizerApplicationYearsQuery();
  const { applicationSummaries, isLoading: summariesLoading } =
    useFertilizerApplicationSummaryOfFarmQuery();
  const { fertilizerApplications, isLoading: applicationsLoading } = useFertilizerApplicationsQuery(undefined, undefined, viewMode === "list");

  const availableYears = useMemo(
    () =>
      (fertilizerApplicationYears ?? []).map(Number).sort((a, b) => b - a),
    [fertilizerApplicationYears],
  );

  // Group by year for SectionList
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
        keys: ["formattedDate", "fertilizer.name", "plot.name"],
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
        <H2>{t("fertilizer_application.fertilizer_application")}</H2>
        <ViewToggle mode={viewMode} onToggle={setViewMode} />
      </View>

      {viewMode === "dashboard" && (
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={t(
            "fertilizer_application.fertilizer_application",
          )}
        >
          {!ready || summariesLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : !applicationSummaries || applicationSummaries.length === 0 ? (
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
          {applicationsLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : sections.length === 0 ? (
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
              renderItem={({ item: fa }) => (
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
                      {t("plots.plot_name_date", {
                        name: fa.plot.name,
                        date: fa.formattedDate,
                      })}
                    </ListItem.Title>
                    <ListItem.Body>
                      {round(fa.numberOfUnits * fa.amountPerUnit, 2)}
                      {fa.unit} {fa.fertilizer.name}
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
        onPress={() => navigation.navigate("SelectFertilizerAndDate", {})}
      />
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
