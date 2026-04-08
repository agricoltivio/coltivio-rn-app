import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";
import { addYears } from "date-fns";
import { Crop } from "@/api/crops.api";
import { Plot } from "@/api/plots.api";
import { PlotCropRotation } from "@/api/crop-rotations.api";
import {
  RotationEntry,
  usePlanCropRotationsStore,
} from "../plan-crop-rotations.store";
import { PlotRotationsList } from "./PlotRotationsList";
import { RotationEditModal } from "./RotationEditModal";
import { CropRotationTimeline } from "../../timeline/CropRotationTimeline";
import { TimelineBar, TimelineData } from "../../timeline/timeline-utils";
import { ZoomLevel } from "../../timeline/ZoomLevelToggle";
import { TIMELINE_HEADER_HEIGHT } from "../../timeline/TimelineHeader";
import { ROW_HEIGHT } from "../../timeline/TimelinePlotRow";
import { hasRotationOverlap } from "../plan-crop-rotations-conflict-utils";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { usePermissions } from "@/features/user/users.hooks";

const MS_PER_DAY = 86_400_000;

type PlotRotationsEditorProps = {
  crops: Crop[];
  selectedPlots: Plot[];
  saving: boolean;
  // Original server rotations — used to detect past-rotation modifications.
  // Pass undefined to skip that check (e.g. in draft mode).
  plotCropRotations?: PlotCropRotation[];
  onSave: () => void;
  onNavigateToCreateCrop: () => void;
};

export function PlotRotationsEditor({
  crops,
  selectedPlots,
  saving,
  plotCropRotations,
  onSave,
  onNavigateToCreateCrop,
}: PlotRotationsEditorProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();

  const { plotPlans, addRotation, updateRotation, removeRotation } =
    usePlanCropRotationsStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRotation, setEditingRotation] = useState<RotationEntry | null>(
    null,
  );
  const [editingPlotId, setEditingPlotId] = useState<string | undefined>();
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("years");

  // Conflict detection
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

  // Waiting-time warning detection
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

      // Self-check: recurring rotation with interval < waiting time
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

  // Build timeline data from store
  const timelineData: TimelineData | null = useMemo(() => {
    if (!selectedPlots.length || !crops || plotPlans.length === 0) return null;

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 25;
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
        const plot = selectedPlots.find((p) => p.id === plan.plotId);
        if (!plot) return null;

        const bars: TimelineBar[] = [];

        plan.rotations.forEach((rotation) => {
          if (!rotation.cropId) return;
          const crop = crops.find((c) => c.id === rotation.cropId);
          if (!crop) return;

          const hasConflict = rotationsWithConflicts.has(rotation.entryId);

          if (rotation.recurrence) {
            let currentFrom = new Date(rotation.fromDate);
            let currentTo = new Date(rotation.toDate);
            const durationMs = currentTo.getTime() - currentFrom.getTime();
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
  }, [selectedPlots, crops, plotPlans, rotationsWithConflicts]);

  // Dynamic timeline height
  const ZOOM_CONTROLS_HEIGHT = 36;
  const ZOOM_CONTROLS_MARGIN = 8;
  const YEAR_ROW_HEIGHT = 20;
  const WEEK_ROW_HEIGHT = 20;
  const EXTRA_PADDING = 10;

  const timelineHeight = useMemo(() => {
    const plotCount = timelineData?.plots.length ?? 0;
    let headerHeight =
      ZOOM_CONTROLS_HEIGHT + ZOOM_CONTROLS_MARGIN + TIMELINE_HEADER_HEIGHT;
    if (zoomLevel === "months") headerHeight += YEAR_ROW_HEIGHT;
    if (zoomLevel === "weeks")
      headerHeight += YEAR_ROW_HEIGHT + WEEK_ROW_HEIGHT;
    const contentHeight = plotCount * ROW_HEIGHT;
    return Math.min(headerHeight + contentHeight + EXTRA_PADDING, 400);
  }, [timelineData, zoomLevel]);

  // Open modal for bar press
  const handleBarPress = useCallback(
    (rotationId: string, _plotName: string) => {
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

  const handleAddRotation = useCallback((plotId: string) => {
    setEditingRotation(null);
    setEditingPlotId(plotId);
    setEditModalVisible(true);
  }, []);

  const handleRotationPress = useCallback(
    (plotId: string, rotation: RotationEntry) => {
      setEditingRotation(rotation);
      setEditingPlotId(plotId);
      setEditModalVisible(true);
    },
    [],
  );

  const handleModalSave = useCallback(
    (plotId: string, rotation: RotationEntry) => {
      if (editingRotation) {
        updateRotation(plotId, rotation.entryId, rotation);
      } else {
        addRotation(plotId, rotation);
      }
    },
    [editingRotation, updateRotation, addRotation],
  );

  const handleModalDelete = useCallback(
    (entryId: string) => {
      if (editingPlotId) {
        removeRotation(editingPlotId, entryId);
      }
    },
    [editingPlotId, removeRotation],
  );

  // Validate and trigger save — shows alert for past rotations if needed
  function handleSavePress() {
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

    if (!plotCropRotations) {
      // No server data provided (e.g. draft mode) — skip past-rotation check
      onSave();
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasModifiedPastRotation = plotPlans.some((plan) =>
      plan.rotations.some((rotation) => {
        if (rotation.fromDate >= today) return false;
        if (!rotation.recurrence && rotation.toDate >= today) return false;
        if (!rotation.rotationId) return true;

        const original = plotCropRotations.find(
          (r) => r.id === rotation.rotationId,
        );
        if (!original) return true;

        if (
          rotation.cropId !== original.cropId ||
          rotation.fromDate.getTime() !==
            new Date(original.fromDate).getTime() ||
          rotation.toDate.getTime() !== new Date(original.toDate).getTime() ||
          rotation.recurrence?.interval !== original.recurrence?.interval
        )
          return true;

        const currentUntil = rotation.recurrence?.until;
        const originalUntil = original.recurrence?.until
          ? new Date(original.recurrence.until)
          : undefined;
        const untilChanged =
          currentUntil?.toISOString().slice(0, 10) !==
          originalUntil?.toISOString().slice(0, 10);

        if (untilChanged) {
          return !!(currentUntil && currentUntil < today);
        }

        return false;
      }),
    );

    if (hasModifiedPastRotation) {
      Alert.alert(
        t("crop_rotations.plan.past_rotations_warning_title"),
        t("crop_rotations.plan.past_rotations_warning_message"),
        [
          { text: t("buttons.cancel"), style: "cancel" },
          { text: t("buttons.confirm"), onPress: onSave },
        ],
      );
    } else {
      onSave();
    }
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

      {/* Rotations list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: theme.spacing.m }}
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
              onRotationPress={canWrite("field_calendar") ? (rotation) =>
                handleRotationPress(plot.id, rotation) : undefined
              }
              onAddPress={canWrite("field_calendar") ? () => handleAddRotation(plot.id) : undefined}
            />
          );
        })}
      </ScrollView>

      {/* Save button */}
      {canWrite("field_calendar") && (
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
            onPress={handleSavePress}
            disabled={saving || hasConflicts}
            loading={saving}
            title={t("crop_rotations.plan.save_plan")}
          />
        </BottomActionContainer>
      )}

      {/* Edit modal */}
      <RotationEditModal
        visible={editModalVisible}
        rotation={editingRotation}
        plots={selectedPlots}
        crops={crops}
        selectedPlotId={editingPlotId}
        onSave={handleModalSave}
        onDelete={editingRotation && canWrite("field_calendar") ? handleModalDelete : undefined}
        onClose={() => setEditModalVisible(false)}
        onNavigateToCreateCrop={() => {
          setEditModalVisible(false);
          onNavigateToCreateCrop();
        }}
      />
    </View>
  );
}
