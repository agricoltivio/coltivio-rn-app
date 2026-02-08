import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { List } from "@/components/list/List";
import { CropRotationsScreenProps } from "./navigation/crop-rotations-routes";
import { H2, Headline } from "@/theme/Typography";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCropRotationYearsQuery,
  useCropRotationsQuery,
} from "./crop-rotations.hooks";
import { ScrollView } from "@/components/views/ScrollView";
import { useTranslation } from "react-i18next";
import { ViewMode, ViewModeToggle } from "./components/ViewModeToggle";
import { CropRotationTimeline } from "./timeline/CropRotationTimeline";
import { buildMultiYearTimelineData } from "./timeline/timeline-utils";
import { CropFilterChips } from "./components/CropFilterChips";

const TIMELINE_RANGE_YEARS = 10;

export function CropRotationsScreen({ navigation }: CropRotationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCropNames, setSelectedCropNames] = useState<Set<string>>(new Set());
  const { cropRotationYears } = useCropRotationYearsQuery();

  // Fixed ±10 year range for the timeline (avoids permanent rotations with year 5000 end dates)
  const currentYear = new Date().getFullYear();
  const timelineFromYear = currentYear - TIMELINE_RANGE_YEARS;
  const timelineToYear = currentYear + TIMELINE_RANGE_YEARS;

  const timelineYears = useMemo(() => {
    const years: number[] = [];
    for (let y = timelineFromYear; y <= timelineToYear; y++) years.push(y);
    return years;
  }, [timelineFromYear, timelineToYear]);

  // Fetch crop rotations with date hints (API may still include permanent ones beyond range —
  // buildMultiYearTimelineData clamps them to the epoch boundaries)
  const timelineFromDate = useMemo(
    () => new Date(timelineFromYear, 0, 1),
    [timelineFromYear],
  );
  const timelineToDate = useMemo(
    () => new Date(timelineToYear + 1, 0, 1),
    [timelineToYear],
  );
  const { cropRotations } = useCropRotationsQuery(
    timelineFromDate,
    timelineToDate,
    viewMode === "timeline",
  );

  // Unique crop names for filter chips
  const uniqueCropNames = useMemo(() => {
    if (!cropRotations) return [];
    const names = new Set(cropRotations.map((cr) => cr.crop.name));
    return Array.from(names).sort();
  }, [cropRotations]);

  // Apply crop filter
  const filteredCropRotations = useMemo(() => {
    if (!cropRotations) return null;
    if (selectedCropNames.size === 0) return cropRotations;
    return cropRotations.filter((cr) => selectedCropNames.has(cr.crop.name));
  }, [cropRotations, selectedCropNames]);

  const timelineData = useMemo(() => {
    if (!filteredCropRotations) return null;
    return buildMultiYearTimelineData(filteredCropRotations, timelineYears);
  }, [filteredCropRotations, timelineYears]);

  function handleToggleCrop(cropName: string) {
    setSelectedCropNames((prev) => {
      const next = new Set(prev);
      if (next.has(cropName)) next.delete(cropName);
      else next.add(cropName);
      return next;
    });
  }

  function handleBarPress(rotationId: string, plotName: string) {
    navigation.navigate("EditPlotCropRotation", { rotationId, plotName });
  }

  if (!cropRotationYears) {
    return null;
  }

  return (
    <ContentView headerVisible>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <H2 style={{ flex: 1 }}>{t("crop_rotations.crop_rotation")}</H2>
        {cropRotationYears.length > 0 && (
          <ViewModeToggle viewMode={viewMode} onChangeViewMode={setViewMode} />
        )}
      </View>

      {/* Crop filter chips - shown in timeline mode */}
      {viewMode === "timeline" && uniqueCropNames.length > 1 && (
        <View style={{ marginTop: theme.spacing.s }}>
          <CropFilterChips
            cropNames={uniqueCropNames}
            selectedCropNames={selectedCropNames}
            onToggleCrop={handleToggleCrop}
          />
        </View>
      )}

      {viewMode === "list" ? (
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={t("crop_rotations.crop_rotation")}
        >
          <View style={{ marginTop: theme.spacing.m }}>
            {cropRotationYears.length === 0 ? (
              <Headline>{t("common.no_entries")}</Headline>
            ) : (
              <List>
                {cropRotationYears.map((year) => (
                  <List.Item
                    key={year}
                    title={year}
                    onPress={() =>
                      navigation.navigate("CropRotationsOfYearList", {
                        year: Number(year),
                      })
                    }
                  />
                ))}
              </List>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          {timelineData && (
            <CropRotationTimeline
              timelineData={timelineData}
              onBarPress={handleBarPress}
            />
          )}
        </View>
      )}

      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("SelectPlotsForPlan")}
      />
    </ContentView>
  );
}
