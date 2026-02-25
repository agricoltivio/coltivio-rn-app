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
import { ActivityIndicator, SectionList, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { PlotCropProtectionApplicationsScreenProps } from "./navigation/plots-routes";
import {
  useCropProtectionApplicationsForPlotQuery,
  useCropProtectionApplicationSummariesOfPlotQuery,
} from "../crop-protection-applications/cropProtectionApplications.hooks";
import { CropProtectionApplicationDashboard } from "../crop-protection-applications/components/CropProtectionApplicationDashboard";

type ViewMode = "dashboard" | "list";

export function PlotCropProtectionApplicationsScreen({
  navigation,
  route,
}: PlotCropProtectionApplicationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId, name } = route.params;

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchText, setSearchText] = useState("");

  const { cropProtectionApplications } =
    useCropProtectionApplicationsForPlotQuery(plotId);
  const { applicationSummaries, isLoading: summariesLoading } =
    useCropProtectionApplicationSummariesOfPlotQuery(plotId);

  // Build SectionList sections for the list view
  const sections = useMemo(() => {
    if (!cropProtectionApplications) return [];
    const sanitized = cropProtectionApplications.map((cpa) => ({
      ...cpa,
      formattedDate: formatLocalizedDate(
        new Date(cpa.dateTime),
        locale,
        "long",
        false,
      ),
    }));

    let filtered = sanitized;
    if (searchText) {
      const fuse = new Fuse(sanitized, {
        minMatchCharLength: 1,
        keys: ["formattedDate", "product.name"],
      });
      filtered = fuse.search(searchText).map((r) => r.item);
    }

    const grouped: Record<number, typeof filtered> = {};
    for (const item of filtered) {
      const year = new Date(item.dateTime).getFullYear();
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(item);
    }
    return Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a)
      .map((year) => ({ title: year.toString(), data: grouped[year] }));
  }, [cropProtectionApplications, searchText]);

  const renderItem = useCallback(
    ({ item: cpa }: { item: (typeof sections)[number]["data"][number] }) => (
      <ListItem
        key={cpa.id}
        onPress={() =>
          navigation.navigate("CropProtectionApplicationDetails", {
            cropProtectionApplicationId: cpa.id,
          })
        }
      >
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>
            {cpa.formattedDate}
          </ListItem.Title>
          <ListItem.Body>
            {round(cpa.numberOfUnits * cpa.amountPerUnit, 2)}
            {cpa.unit} {cpa.product.name}
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [navigation],
  );

  if (!cropProtectionApplications) {
    return (
      <ContentView headerVisible>
        <H2>{t("crop_protection_applications.crop_protection")}</H2>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </ContentView>
    );
  }

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
          <H2>{t("crop_protection_applications.crop_protection")}</H2>
          <H3>{t("plots.plot_name", { name })}</H3>
        </View>
        <ViewToggle mode={viewMode} onToggle={setViewMode} />
      </View>

      {viewMode === "dashboard" && (
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={t(
            "crop_protection_applications.crop_protection",
          )}
        >
          {summariesLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" />
          ) : !applicationSummaries || applicationSummaries.length === 0 ? (
            <Headline>{t("common.no_entries")}</Headline>
          ) : (
            <CropProtectionApplicationDashboard
              summaries={applicationSummaries}
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
