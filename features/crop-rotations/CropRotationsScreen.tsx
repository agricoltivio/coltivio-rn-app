import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { CropRotationsScreenProps } from "./navigation/crop-rotations-routes";
import { H2 } from "@/theme/Typography";
import React, { useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropRotationsQuery } from "./crop-rotations.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { useTranslation } from "react-i18next";
import { CropRotationTimeline } from "./timeline/CropRotationTimeline";
import {
  buildMultiYearTimelineData,
  SimplePlot,
} from "./timeline/timeline-utils";
import { CropFilterChips } from "./components/CropFilterChips";
import { Ionicons } from "@expo/vector-icons";

const TIMELINE_RANGE_YEARS = 10;

export function CropRotationsScreen({ navigation }: CropRotationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedCropNames, setSelectedCropNames] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");

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
    true,
  );

  // Fetch all farm plots so we can show plots without crop rotations too
  const { plots: allPlots } = useFarmPlotsQuery();

  // Map all plots to SimplePlot, filtered by search query
  const filteredPlots = useMemo((): SimplePlot[] | undefined => {
    if (!allPlots) return undefined;
    const query = searchQuery.trim().toLowerCase();
    const mapped = allPlots.map((p) => ({ id: p.id, name: p.name }));
    if (!query) return mapped;
    return mapped.filter((p) => p.name.toLowerCase().includes(query));
  }, [allPlots, searchQuery]);

  // Unique crop names for filter chips
  const uniqueCropNames = useMemo(() => {
    if (!cropRotations) return [];
    const names = new Set(cropRotations.map((cr) => cr.crop.name));
    return Array.from(names).sort();
  }, [cropRotations]);

  // Apply crop filter + search filter
  const filteredCropRotations = useMemo(() => {
    if (!cropRotations) return null;
    let result = cropRotations;
    if (selectedCropNames.size > 0) {
      result = result.filter((cr) => selectedCropNames.has(cr.crop.name));
    }
    // When searching, only keep rotations for matching plots
    if (filteredPlots) {
      const plotIds = new Set(filteredPlots.map((p) => p.id));
      result = result.filter((cr) => plotIds.has(cr.plotId));
    }
    return result;
  }, [cropRotations, selectedCropNames, filteredPlots]);

  const timelineData = useMemo(() => {
    if (!filteredCropRotations) return null;
    return buildMultiYearTimelineData(
      filteredCropRotations,
      timelineYears,
      filteredPlots,
    );
  }, [filteredCropRotations, timelineYears, filteredPlots]);

  function handleToggleCrop(cropName: string) {
    setSelectedCropNames((prev) => {
      const next = new Set(prev);
      if (next.has(cropName)) next.delete(cropName);
      else next.add(cropName);
      return next;
    });
  }

  // All recurrences of the same rotation share the same plotId, so first match is fine
  function handleBarPress(rotationId: string, _plotName: string) {
    const plotId = cropRotations?.find((cr) => cr.id === rotationId)?.plotId;
    if (plotId) {
      navigation.navigate("PlanCropRotations", { plotIds: [plotId] });
    }
  }

  function handlePlotPress(plotId: string) {
    navigation.navigate("PlanCropRotations", { plotIds: [plotId] });
  }

  return (
    <ContentView headerVisible>
      <H2>{t("crop_rotations.crop_rotation")}</H2>

      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.white,
          borderRadius: theme.radii.m,
          paddingHorizontal: 10,
          marginTop: theme.spacing.s,
          borderWidth: 1,
          borderColor: theme.colors.gray3,
        }}
      >
        <Ionicons name="search" size={18} color={theme.colors.gray2} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("forms.placeholders.search")}
          returnKeyType="search"
          placeholderTextColor={theme.colors.gray2}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 8,
            fontSize: 15,
            color: theme.colors.gray0,
          }}
        />
      </View>

      {/* Crop filter chips */}
      {uniqueCropNames.length > 1 && (
        <View style={{ marginTop: theme.spacing.s }}>
          <CropFilterChips
            cropNames={uniqueCropNames}
            selectedCropNames={selectedCropNames}
            onToggleCrop={handleToggleCrop}
          />
        </View>
      )}

      <View style={{ flex: 1, marginTop: theme.spacing.m }}>
        {timelineData && (
          <CropRotationTimeline
            timelineData={timelineData}
            onBarPress={handleBarPress}
            onPlotPress={handlePlotPress}
          />
        )}
      </View>

      <FAB
        icon={{ name: "create-outline", color: "white" }}
        onPress={() => navigation.navigate("SelectPlotsForPlan")}
      />
    </ContentView>
  );
}
