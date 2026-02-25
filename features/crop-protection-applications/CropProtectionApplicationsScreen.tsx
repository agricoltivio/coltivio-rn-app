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
import {
  ActivityIndicator,
  SectionList,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styled-components/native";
import { CropProtectionApplicationDashboard } from "./components/CropProtectionApplicationDashboard";
import {
  useCropProtectionApplicationSummariesOfFarmQuery,
  useCropProtectionApplicationsQuery,
} from "./cropProtectionApplications.hooks";
import { CropProtectionApplicationsScreenProps } from "./navigation/crop-protection-application-routes";

type ViewMode = "dashboard" | "list";

export function CropProtectionApplicationsScreen({
  navigation,
}: CropProtectionApplicationsScreenProps) {
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

  const { applicationSummaries, isLoading: summariesLoading } =
    useCropProtectionApplicationSummariesOfFarmQuery();
  const { cropProtectionApplications, isLoading: applicationsLoading } =
    useCropProtectionApplicationsQuery(
      undefined,
      undefined,
      viewMode === "list",
    );

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
        keys: ["formattedDate", "product.name", "plot.name"],
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
        <H2>{t("crop_protection_applications.crop_protection")}</H2>
        <ViewToggle mode={viewMode} onToggle={setViewMode} />
      </View>

      {viewMode === "dashboard" && (
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={t(
            "crop_protection_applications.crop_protection",
          )}
        >
          {!ready || summariesLoading ? (
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
              renderItem={({ item: cpa }) => (
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
                      {t("plots.plot_name_date", {
                        name: cpa.plot.name,
                        date: cpa.formattedDate,
                      })}
                    </ListItem.Title>
                    <ListItem.Body>
                      {round(cpa.numberOfUnits * cpa.amountPerUnit, 2)}
                      {cpa.unit} {cpa.product.name}
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
        onPress={() =>
          navigation.navigate(
            "SelectCropProtectionApplicationProductAndDate",
            {},
          )
        }
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
