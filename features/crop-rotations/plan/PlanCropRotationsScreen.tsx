import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "styled-components/native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  usePlanCropRotationsStore,
  RotationEntry,
} from "./plan-crop-rotations.store";
import { PlotRotationsList } from "./components/PlotRotationsList";
import { RotationEditModal } from "./components/RotationEditModal";
import { useCropsQuery } from "@/features/crops/crops.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import {
  useCropRotationsByPlotIdsQuery,
  usePlanCropRotationsMutation,
} from "../crop-rotations.hooks";
import { PlanCropRotationsScreenProps } from "../navigation/crop-rotations-routes.d";
import { hasRotationOverlap } from "./plan-crop-rotations-conflict-utils";
import { CropRotationTimeline } from "../timeline/CropRotationTimeline";
import { TimelineBar, TimelineData } from "../timeline/timeline-utils";
import { ZoomLevel } from "../timeline/ZoomLevelToggle";
import { TIMELINE_HEADER_HEIGHT } from "../timeline/TimelineHeader";
import { ROW_HEIGHT } from "../timeline/TimelinePlotRow";
import { addYears, subYears } from "date-fns";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";

const MS_PER_DAY = 86_400_000;

export function PlanCropRotationsScreen({
  route,
}: PlanCropRotationsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const plotIdsFromParams = route.params.plotIds!;
  const previousScreen = route.params.previousScreen;

  // Set translated header title
  useEffect(() => {
    navigation.setOptions({ title: t("crop_rotations.plan.title") });
  }, [navigation, t]);

  const {
    plotPlans,
    setPlotIds,
    initializeFromExisting,
    addRotation,
    updateRotation,
    removeRotation,
    reset,
  } = usePlanCropRotationsStore();
  const { crops, isLoading: cropsLoading } = useCropsQuery();
  const { plots, isLoading: plotsLoading } = useFarmPlotsQuery();
  const [saving, setSaving] = useState(false);
  const initializedRef = useRef(false);

  // Modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRotation, setEditingRotation] = useState<RotationEntry | null>(
    null,
  );
  const [editingPlotId, setEditingPlotId] = useState<string | undefined>();

  // Timeline zoom state for dynamic height calculation
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("years");

  const selectedPlotIds = plotIdsFromParams;
  const queryFromDate = subYears(new Date(), 10);
  const queryToDate = addYears(new Date(), 25);

  const { plotCropRotations, isLoading: rotationsLoading } =
    useCropRotationsByPlotIdsQuery(
      selectedPlotIds,
      queryFromDate,
      queryToDate,
      { onlyCurrent: false, expand: false, includeRecurrence: true },
      selectedPlotIds.length > 0,
    );

  // Initialize store with existing rotations when they load
  useEffect(() => {
    if (!initializedRef.current && plotCropRotations) {
      if (plotCropRotations.length > 0) {
        initializeFromExisting(plotIdsFromParams, plotCropRotations);
      } else {
        setPlotIds(plotIdsFromParams);
      }
      initializedRef.current = true;
    }
  }, [
    plotCropRotations,
    plotIdsFromParams,
    initializeFromExisting,
    setPlotIds,
  ]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const planMutation = usePlanCropRotationsMutation(
    () => {
      setSaving(false);
      reset();
      if (previousScreen === "PlotDetails") {
        navigation.goBack();
      } else {
        // Reset stack to: Home > FieldCalendar > CropRotations
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
      }
    },
    () => {
      setSaving(false);
    },
  );

  // Detect conflicts between rotations
  // For recurring rotations, check both day-of-year overlap AND that they occur in a common year
  const rotationsWithConflicts = useMemo(() => {
    const conflicts = new Map<string, string>();
    const currentYear = new Date().getFullYear();
    const allRotations = plotPlans.flatMap((p) => p.rotations);
    const maxUntilYear = allRotations.reduce((max, r) => {
      const until = r.recurrence?.until?.getFullYear();
      return until && until > max ? until : max;
    }, currentYear + 25);
    const rangeStart = currentYear - 10;
    const rangeEnd = maxUntilYear;

    plotPlans.forEach((plan) => {
      const rotations = plan.rotations;
      for (let i = 0; i < rotations.length; i++) {
        for (let j = i + 1; j < rotations.length; j++) {
          const a = rotations[i];
          const b = rotations[j];
          if (!a.cropId || !b.cropId) continue;

          if (hasRotationOverlap(a, b, rangeStart, rangeEnd)) {
            const cropNameA =
              crops?.find((c) => c.id === a.cropId)?.name ||
              t("crop_rotations.crop_rotation");
            const cropNameB =
              crops?.find((c) => c.id === b.cropId)?.name ||
              t("crop_rotations.crop_rotation");
            conflicts.set(
              a.entryId,
              t("crop_rotations.plan.overlaps_with", { crop: cropNameB }),
            );
            conflicts.set(
              b.entryId,
              t("crop_rotations.plan.overlaps_with", { crop: cropNameA }),
            );
          }
        }
      }
    });

    return conflicts;
  }, [plotPlans, crops, t]);

  const hasConflicts = rotationsWithConflicts.size > 0;

  // Detect waiting time violations between rotations of same crop or same family
  const rotationsWithWarnings = useMemo(() => {
    const warnings = new Map<string, string>();
    if (!crops) return warnings;

    const currentYear = new Date().getFullYear();
    const allRotations = plotPlans.flatMap((p) => p.rotations);
    const maxUntilYear = allRotations.reduce((max, r) => {
      const until = r.recurrence?.until?.getFullYear();
      return until && until > max ? until : max;
    }, currentYear + 25);
    const rangeStart = currentYear - 10;
    const rangeEnd = maxUntilYear;

    // Get all years a rotation occurs in
    const getYears = (rotation: RotationEntry): number[] => {
      const startYear = rotation.fromDate.getFullYear();
      if (!rotation.recurrence) return [startYear];
      const interval = rotation.recurrence.interval;
      const untilYear = rotation.recurrence.until?.getFullYear() ?? rangeEnd;
      const effectiveEnd = Math.min(untilYear, rangeEnd);
      const years: number[] = [];
      for (let y = startYear; y <= effectiveEnd; y += interval) {
        if (y >= rangeStart) years.push(y);
      }
      return years;
    };

    // Determine effective waiting time for a pair of rotations
    const getEffectiveWaitingTime = (
      cropA: (typeof crops)[number],
      cropB: (typeof crops)[number],
      sameCrop: boolean,
    ): {
      waitingTime: number;
      isFamilyLevel: boolean;
      familyName: string;
    } | null => {
      if (sameCrop) {
        // Same crop: use crop's own waiting time, fall back to family
        if (cropA.waitingTimeInYears) {
          return {
            waitingTime: cropA.waitingTimeInYears,
            isFamilyLevel: false,
            familyName: "",
          };
        }
        if (cropA.family?.waitingTimeInYears) {
          return {
            waitingTime: cropA.family.waitingTimeInYears,
            isFamilyLevel: true,
            familyName: cropA.family.name,
          };
        }
        return null;
      }
      // Different crops, same family
      if (
        cropA.familyId &&
        cropA.familyId === cropB.familyId &&
        cropA.family?.waitingTimeInYears
      ) {
        return {
          waitingTime: cropA.family.waitingTimeInYears,
          isFamilyLevel: true,
          familyName: cropA.family.name,
        };
      }
      return null;
    };

    plotPlans.forEach((plan) => {
      const rotations = plan.rotations;

      // Self-check: recurring rotation with interval < effective waiting time
      for (const rotation of rotations) {
        if (!rotation.cropId || !rotation.recurrence) continue;
        const crop = crops.find((c) => c.id === rotation.cropId);
        if (!crop) continue;
        const info = getEffectiveWaitingTime(crop, crop, true);
        if (!info) continue;
        if (rotation.recurrence.interval < info.waitingTime) {
          const msg = info.isFamilyLevel
            ? t("crop_rotations.plan.waiting_time_warning_family", {
                family: info.familyName,
                waitingTime: info.waitingTime,
              })
            : t("crop_rotations.plan.waiting_time_warning_crop", {
                crop: crop.name,
                waitingTime: info.waitingTime,
              });
          warnings.set(rotation.entryId, msg);
        }
      }

      // Pairwise check
      for (let i = 0; i < rotations.length; i++) {
        for (let j = i + 1; j < rotations.length; j++) {
          const a = rotations[i];
          const b = rotations[j];
          if (!a.cropId || !b.cropId) continue;

          const cropA = crops.find((c) => c.id === a.cropId);
          const cropB = crops.find((c) => c.id === b.cropId);
          if (!cropA || !cropB) continue;

          const sameCrop = a.cropId === b.cropId;
          const sameFamily =
            !sameCrop && !!cropA.familyId && cropA.familyId === cropB.familyId;
          if (!sameCrop && !sameFamily) continue;

          const info = getEffectiveWaitingTime(cropA, cropB, sameCrop);
          if (!info) continue;

          // Merge occurrence years and check consecutive gaps
          const aYears = getYears(a);
          const bYears = getYears(b);
          const allYears = [...new Set([...aYears, ...bYears])].sort(
            (x, y) => x - y,
          );

          let violation = false;
          for (let k = 1; k < allYears.length; k++) {
            if (allYears[k] - allYears[k - 1] < info.waitingTime) {
              violation = true;
              break;
            }
          }

          if (violation) {
            const msg = info.isFamilyLevel
              ? t("crop_rotations.plan.waiting_time_warning_family", {
                  family: info.familyName,
                  waitingTime: info.waitingTime,
                })
              : t("crop_rotations.plan.waiting_time_warning_crop", {
                  crop: cropA.name,
                  waitingTime: info.waitingTime,
                });
            if (!warnings.has(a.entryId)) warnings.set(a.entryId, msg);
            if (!warnings.has(b.entryId)) warnings.set(b.entryId, msg);
          }
        }
      }
    });

    return warnings;
  }, [plotPlans, crops, t]);

  // Expand recurrences and build timeline data from store
  const timelineData: TimelineData | null = useMemo(() => {
    if (!plots || !crops || plotPlans.length === 0) return null;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 25;
    // Generate all years in range for the year context row in months/weeks view
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }
    const epochStart = new Date(startYear, 0, 1);
    const epochEnd = new Date(endYear, 11, 31);
    const totalDays = Math.ceil(
      (epochEnd.getTime() - epochStart.getTime()) / MS_PER_DAY,
    );

    const timelinePlots = plotPlans
      .map((plan) => {
        const plot = plots.find((p) => p.id === plan.plotId);
        if (!plot) return null;

        const bars: TimelineBar[] = [];

        plan.rotations.forEach((rotation) => {
          if (!rotation.cropId) return;
          const crop = crops.find((c) => c.id === rotation.cropId);
          if (!crop) return;

          const hasConflict = rotationsWithConflicts.has(rotation.entryId);

          // Expand recurrence if present (with or without until date)
          if (rotation.recurrence) {
            let currentFrom = new Date(rotation.fromDate);
            let currentTo = new Date(rotation.toDate);
            const durationMs = currentTo.getTime() - currentFrom.getTime();
            // Use until if set, otherwise expand until timeline boundary (epochEnd)
            const untilTime = rotation.recurrence.until
              ? Math.min(
                  rotation.recurrence.until.getTime(),
                  epochEnd.getTime(),
                )
              : epochEnd.getTime();
            const interval = rotation.recurrence.interval;

            let iteration = 0;
            while (currentFrom.getTime() <= untilTime && iteration < 100) {
              if (currentTo >= epochStart && currentFrom <= epochEnd) {
                const startDay = Math.floor(
                  (currentFrom.getTime() - epochStart.getTime()) / MS_PER_DAY,
                );
                const endDay = Math.floor(
                  (currentTo.getTime() - epochStart.getTime()) / MS_PER_DAY,
                );

                bars.push({
                  rotationId: rotation.rotationId || rotation.entryId,
                  entryId: rotation.entryId,
                  cropName: crop.name,
                  plotName: plot.name,
                  plotId: plot.id,
                  startDay,
                  endDay,
                  isOpenEnded: false,
                  isPlanned: !rotation.rotationId,
                  hasConflict,
                });
              }

              currentFrom = addYears(currentFrom, interval);
              currentTo = new Date(currentFrom.getTime() + durationMs);
              iteration++;
            }
          } else {
            // Single occurrence
            const startDay = Math.floor(
              (rotation.fromDate.getTime() - epochStart.getTime()) / MS_PER_DAY,
            );
            const endDay = Math.floor(
              (rotation.toDate.getTime() - epochStart.getTime()) / MS_PER_DAY,
            );

            bars.push({
              rotationId: rotation.rotationId || rotation.entryId,
              entryId: rotation.entryId,
              cropName: crop.name,
              plotName: plot.name,
              plotId: plot.id,
              startDay,
              endDay,
              isOpenEnded: false,
              isPlanned: !rotation.rotationId,
              hasConflict,
            });
          }
        });

        return {
          plotId: plot.id,
          plotName: plot.name,
          bars,
        };
      })
      .filter(Boolean) as {
      plotId: string;
      plotName: string;
      bars: TimelineBar[];
    }[];

    return {
      totalDays,
      epochStart,
      years,
      plots: timelinePlots.sort((a, b) => a.plotName.localeCompare(b.plotName)),
    };
  }, [plots, crops, plotPlans, rotationsWithConflicts]);

  const selectedPlots = useMemo(() => {
    if (!plots) return [];
    return plots.filter((p) => selectedPlotIds.includes(p.id));
  }, [plots, selectedPlotIds]);

  // Handle bar press - find rotation and open modal
  const handleBarPress = useCallback(
    (rotationId: string, _plotName: string) => {
      // Find the rotation entry by entryId or rotationId
      for (const plan of plotPlans) {
        const rotation = plan.rotations.find(
          (r) => r.entryId === rotationId || r.rotationId === rotationId,
        );
        if (rotation) {
          setEditingRotation(rotation);
          setEditingPlotId(plan.plotId);
          setEditModalVisible(true);
          return;
        }
      }
    },
    [plotPlans],
  );

  // Handle add new rotation for a plot
  const handleAddRotation = useCallback((plotId: string) => {
    setEditingRotation(null);
    setEditingPlotId(plotId);
    setEditModalVisible(true);
  }, []);

  // Handle rotation press from list
  const handleRotationPress = useCallback(
    (plotId: string, rotation: RotationEntry) => {
      setEditingRotation(rotation);
      setEditingPlotId(plotId);
      setEditModalVisible(true);
    },
    [],
  );

  // Handle save from modal
  const handleModalSave = useCallback(
    (plotId: string, rotation: RotationEntry) => {
      if (editingRotation) {
        // Update existing
        updateRotation(plotId, rotation.entryId, rotation);
      } else {
        // Add new
        addRotation(plotId, rotation);
      }
    },
    [editingRotation, updateRotation, addRotation],
  );

  // Handle delete from modal
  const handleModalDelete = useCallback(
    (entryId: string) => {
      if (editingPlotId) {
        removeRotation(editingPlotId, entryId);
      }
    },
    [editingPlotId, removeRotation],
  );

  const handleSave = () => {
    if (!crops) return;

    const hasInvalidRotations = plotPlans.some((plan) =>
      plan.rotations.some((r) => !r.cropId),
    );

    if (hasInvalidRotations) {
      alert(t("crop_rotations.plan.select_crop_for_all"));
      return;
    }

    if (hasConflicts) {
      alert(t("crop_rotations.plan.resolve_conflicts_alert"));
      return;
    }

    setSaving(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if any past-dated rotation is new or has been modified
    const hasModifiedPastRotation = plotPlans.some((plan) =>
      plan.rotations.some((rotation) => {
        if (rotation.fromDate >= today) return false;

        // Non-recurring and still ongoing → skip
        if (!rotation.recurrence && rotation.toDate >= today) return false;

        // New rotation placed in the past
        if (!rotation.rotationId) return true;

        // Existing rotation — compare against original server data
        const original = plotCropRotations?.find(
          (r) => r.id === rotation.rotationId,
        );
        if (!original) return true;

        // Crop, date, or interval changes always affect past occurrences → warn
        if (
          rotation.cropId !== original.cropId ||
          rotation.fromDate.getTime() !== new Date(original.fromDate).getTime() ||
          rotation.toDate.getTime() !== new Date(original.toDate).getTime() ||
          rotation.recurrence?.interval !== original.recurrence?.interval
        )
          return true;

        // Only the until date changed: skip warning if new until is today or future
        const currentUntil = rotation.recurrence?.until;
        const originalUntil = original.recurrence?.until
          ? new Date(original.recurrence.until)
          : undefined;
        const untilChanged =
          currentUntil?.toISOString().slice(0, 10) !==
          originalUntil?.toISOString().slice(0, 10);

        if (untilChanged) {
          // Warn only if the new until is in the past
          return !!(currentUntil && currentUntil < today);
        }

        return false;
      }),
    );

    const input = {
      plots: plotPlans.map((plan) => ({
        plotId: plan.plotId,
        rotations: plan.rotations.map((rotation) => ({
          id: rotation.rotationId,
          cropId: rotation.cropId,
          fromDate: rotation.fromDate.toISOString(),
          toDate: rotation.toDate.toISOString(),
          recurrence: rotation.recurrence
            ? {
                interval: rotation.recurrence.interval,
                until: rotation.recurrence.until?.toISOString(),
              }
            : undefined,
        })),
      })),
    };

    if (hasModifiedPastRotation) {
      Alert.alert(
        t("crop_rotations.plan.past_rotations_warning_title"),
        t("crop_rotations.plan.past_rotations_warning_message"),
        [
          {
            text: t("buttons.cancel"),
            style: "cancel",
            onPress: () => setSaving(false),
          },
          { text: t("buttons.confirm"), onPress: () => planMutation.mutate(input) },
        ],
      );
      return;
    }

    planMutation.mutate(input);
  };

  // Dynamic timeline height based on zoom level and plot count
  const ZOOM_CONTROLS_HEIGHT = 36;
  const ZOOM_CONTROLS_MARGIN = 8; // marginBottom: theme.spacing.s
  const YEAR_ROW_HEIGHT = 20;
  const WEEK_ROW_HEIGHT = 20;
  const EXTRA_PADDING = 10; // borders and small gaps

  const timelineHeight = useMemo(() => {
    const plotCount = timelineData?.plots.length ?? 0;

    // Header height varies by zoom level
    let headerHeight =
      ZOOM_CONTROLS_HEIGHT + ZOOM_CONTROLS_MARGIN + TIMELINE_HEADER_HEIGHT;
    if (zoomLevel === "months") headerHeight += YEAR_ROW_HEIGHT;
    if (zoomLevel === "weeks")
      headerHeight += YEAR_ROW_HEIGHT + WEEK_ROW_HEIGHT;

    const contentHeight = plotCount * ROW_HEIGHT;
    const totalHeight = headerHeight + contentHeight + EXTRA_PADDING;

    const maxHeight = 400;
    return Math.min(totalHeight, maxHeight);
  }, [timelineData, zoomLevel]);

  if (cropsLoading || plotsLoading || rotationsLoading || !crops || !plots) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Timeline */}
      {timelineData && timelineData.plots.length > 0 && (
        <View
          style={{
            height: timelineHeight,
            maxHeight: 400,
            paddingHorizontal: theme.spacing.m,
            paddingTop: theme.spacing.m,
          }}
        >
          <CropRotationTimeline
            timelineData={timelineData}
            onBarPress={handleBarPress}
            onZoomChange={setZoomLevel}
          />
        </View>
      )}

      {/* Rotations List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.m,
        }}
      >
        {selectedPlots.map((plot) => {
          const plan = plotPlans.find((p) => p.plotId === plot.id);
          const rotations = (plan?.rotations || []).map((r) => ({
            ...r,
            conflictMessage: rotationsWithConflicts.get(r.entryId),
            warningMessage: rotationsWithWarnings.get(r.entryId),
          }));

          return (
            <PlotRotationsList
              key={plot.id}
              plotId={plot.id}
              plotName={plot.name}
              rotations={rotations}
              crops={crops}
              onRotationPress={(rotation) =>
                handleRotationPress(plot.id, rotation)
              }
              onAddPress={() => handleAddRotation(plot.id)}
            />
          );
        })}
      </ScrollView>

      {/* Save Button */}
      <BottomActionContainer>
        {hasConflicts && (
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.danger,
              textAlign: "center",
              marginBottom: theme.spacing.s,
            }}
          >
            {t("crop_rotations.plan.resolve_conflicts_warning")}
          </Text>
        )}
        <Button
          onPress={handleSave}
          disabled={saving || hasConflicts}
          loading={saving}
          title={t("crop_rotations.plan.save_plan")}
        />
      </BottomActionContainer>

      {/* Edit Modal */}
      <RotationEditModal
        visible={editModalVisible}
        rotation={editingRotation}
        plots={selectedPlots}
        crops={crops}
        selectedPlotId={editingPlotId}
        onSave={handleModalSave}
        onDelete={editingRotation ? handleModalDelete : undefined}
        onClose={() => setEditModalVisible(false)}
        onNavigateToCreateCrop={() => {
          setEditModalVisible(false);
          navigation.navigate("CreateCrop");
        }}
      />
    </View>
  );
}
