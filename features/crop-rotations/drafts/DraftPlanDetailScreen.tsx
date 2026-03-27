import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { H2, Subtitle } from "@/theme/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, TextInput, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { CommonActions } from "@react-navigation/native";
import {
  buildMultiYearTimelineData,
  buildSkeletonTimelineData,
  expandRotations,
  SimplePlot,
} from "../timeline/timeline-utils";
import { CropRotationTimeline } from "../timeline/CropRotationTimeline";
import { CropFilterChips } from "../components/CropFilterChips";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import {
  useDraftPlanQuery,
  useApplyDraftPlanMutation,
} from "../crop-rotations.hooks";
import { DraftPlanDetailScreenProps } from "../navigation/crop-rotations-routes.d";

const TIMELINE_RANGE_YEARS = 10;

export function DraftPlanDetailScreen({ route, navigation }: DraftPlanDetailScreenProps) {
  const { draftPlanId } = route.params;
  const { t } = useTranslation();
  const theme = useTheme();

  const [selectedCropNames, setSelectedCropNames] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [transitionDone, setTransitionDone] = useState(false);

  useEffect(() => {
    return navigation.addListener("transitionEnd", () => {
      // Defer by one frame so React can commit lighter work before mounting the heavy timeline
      requestAnimationFrame(() => setTransitionDone(true));
    });
  }, [navigation]);

  const currentYear = new Date().getFullYear();
  const timelineFromYear = currentYear - TIMELINE_RANGE_YEARS;
  const timelineToYear = currentYear + TIMELINE_RANGE_YEARS;

  const timelineYears = useMemo(() => {
    const years: number[] = [];
    for (let y = timelineFromYear; y <= timelineToYear; y++) years.push(y);
    return years;
  }, [timelineFromYear, timelineToYear]);

  const { draftPlan } = useDraftPlanQuery(draftPlanId);
  const { plots: allPlots } = useFarmPlotsQuery();
  const applyMutation = useApplyDraftPlanMutation(
    () => {
      navigation.dispatch(
        CommonActions.reset({
          index: 2,
          routes: [
            { name: "Home" },
            { name: "FieldCalendar" },
            { name: "CropRotations" },
          ],
        }),
      );
    },
  );

  // Flatten draftPlan.plots[].rotations into the shape buildMultiYearTimelineData expects.
  const draftRotations = useMemo(() => {
    if (!draftPlan || !allPlots) return [];
    const plotNameById = new Map(allPlots.map((p) => [p.id, p.name]));
    return draftPlan.plots.flatMap((plotData) =>
      plotData.rotations.map((rotation) => ({
        id: rotation.id,
        farmId: rotation.farmId,
        plotId: plotData.plotId,
        cropId: rotation.cropId,
        sowingDate: rotation.sowingDate,
        fromDate: rotation.fromDate,
        toDate: rotation.toDate,
        crop: rotation.crop,
        plot: { id: plotData.plotId, name: plotNameById.get(plotData.plotId) ?? "" },
        recurrence: rotation.recurrence
          ? { id: rotation.recurrence.id, interval: rotation.recurrence.interval, until: rotation.recurrence.until }
          : null,
      }))
    );
  }, [draftPlan, allPlots]);

  // Unique crop names for filter chips
  const uniqueCropNames = useMemo(() => {
    const names = new Set(draftRotations.map((r) => r.crop.name));
    return Array.from(names).sort();
  }, [draftRotations]);

  // Only show plots that are included in the draft, filtered by search query
  const filteredPlots = useMemo((): SimplePlot[] | undefined => {
    if (!allPlots || !draftPlan) return undefined;
    const draftPlotIds = new Set(draftPlan.plots.map((p) => p.plotId));
    const query = searchQuery.trim().toLowerCase();
    const mapped = allPlots
      .filter((p) => draftPlotIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.name }));
    if (!query) return mapped;
    return mapped.filter((p) => p.name.toLowerCase().includes(query));
  }, [allPlots, draftPlan, searchQuery]);

  const filteredRotations = useMemo(() => {
    let result = draftRotations;
    if (selectedCropNames.size > 0) {
      result = result.filter((r) => selectedCropNames.has(r.crop.name));
    }
    if (filteredPlots) {
      const plotIds = new Set(filteredPlots.map((p) => p.id));
      result = result.filter((r) => plotIds.has(r.plotId));
    }
    return result;
  }, [draftRotations, selectedCropNames, filteredPlots]);

  // Only show plots that have matching rotations when crop filter is active;
  // otherwise show all plots (including empty ones).
  const timelinePlots = useMemo(() => {
    if (selectedCropNames.size === 0) return filteredPlots;
    if (!filteredPlots) return undefined;
    const plotIdsWithRotations = new Set(filteredRotations.map((r) => r.plotId));
    return filteredPlots.filter((p) => plotIdsWithRotations.has(p.id));
  }, [filteredPlots, filteredRotations, selectedCropNames]);

  const timelineData = useMemo(() => {
    // Don't mount the timeline during the navigation transition — it's expensive
    if (!transitionDone || !filteredPlots) return null;
    // Show skeleton while draft plan or plots are still loading
    if (!draftPlan || !allPlots) {
      return buildSkeletonTimelineData(timelinePlots ?? filteredPlots, timelineYears);
    }
    const expanded = expandRotations(
      filteredRotations,
      timelineFromYear,
      timelineToYear,
    );
    return buildMultiYearTimelineData(expanded, timelineYears, timelinePlots);
  }, [transitionDone, filteredPlots, draftPlan, allPlots, filteredRotations, timelineFromYear, timelineToYear, timelineYears, timelinePlots]);

  function handleToggleCrop(cropName: string) {
    setSelectedCropNames((prev) => {
      const next = new Set(prev);
      if (next.has(cropName)) next.delete(cropName);
      else next.add(cropName);
      return next;
    });
  }

  function handleBarPress(rotationId: string) {
    for (const plotData of draftPlan?.plots ?? []) {
      if (plotData.rotations.some((r) => r.id === rotationId)) {
        navigation.navigate("PlanDraftRotations", {
          draftPlanId,
          plotIds: [plotData.plotId],
        });
        return;
      }
    }
  }

  function handlePlotPress(plotId: string) {
    navigation.navigate("PlanDraftRotations", {
      draftPlanId,
      plotIds: [plotId],
    });
  }

  function handleApply() {
    Alert.alert(
      t("crop_rotations.draft_plans.apply_confirm_title"),
      t("crop_rotations.draft_plans.apply_confirm_message"),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("crop_rotations.draft_plans.apply"),
          onPress: () => applyMutation.mutate({ draftPlanId }),
        },
      ],
    );
  }

  return (
    <ContentView headerVisible>
      {/* Title row with Apply button */}
      <View
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <H2 style={{ flex: 1 }}>
          {draftPlan?.name ?? t("crop_rotations.draft_plans.title")}
        </H2>
        <Pressable onPress={handleApply}>
          <Subtitle style={{ color: theme.colors.primary }}>
            {t("crop_rotations.draft_plans.apply")}
          </Subtitle>
        </Pressable>
      </View>

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
        {timelineData ? (
          <>
            <CropRotationTimeline
              timelineData={timelineData}
              onBarPress={handleBarPress}
              onPlotPress={handlePlotPress}
              onAddPlot={() => navigation.navigate("AddPlotsToDraft", { draftPlanId })}
            />
            {(!draftPlan || !allPlots) && (
              <ActivityIndicator
                style={{ position: "absolute", top: theme.spacing.xl, alignSelf: "center" }}
              />
            )}
          </>
        ) : (
          <ActivityIndicator style={{ marginTop: theme.spacing.xl }} />
        )}
      </View>

      <FAB
        icon={{ name: "create-outline", color: "white" }}
        onPress={() => navigation.navigate("SelectPlotsForPlan", { draftPlanId })}
      />
    </ContentView>
  );
}
