import { useEffect, useMemo, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { usePlanCropRotationsStore } from "../plan/plan-crop-rotations.store";
import { useCropsQuery } from "@/features/crops/crops.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import {
  useDraftPlanQuery,
  useUpdateDraftPlanMutation,
} from "../crop-rotations.hooks";
import { PlanDraftRotationsScreenProps } from "../navigation/crop-rotations-routes.d";
import { PlotRotationsEditor } from "../plan/components/PlotRotationsEditor";
import { DraftPlanRotation } from "@/api/crop-rotations.api";

// Map a DraftPlanRotation (from draftPlan.plots[].rotations[]) to the shape initializeFromExisting expects
function draftRotationToPlotCropRotation(rotation: DraftPlanRotation, plotId: string) {
  return {
    id: rotation.id,
    farmId: rotation.farmId,
    plotId,
    cropId: rotation.cropId,
    crop: rotation.crop,
    fromDate: rotation.fromDate,
    toDate: rotation.toDate,
    sowingDate: rotation.sowingDate,
    recurrence: rotation.recurrence
      ? {
          id: rotation.recurrence.id,
          interval: rotation.recurrence.interval,
          until: rotation.recurrence.until ?? null,
        }
      : null,
    plot: { id: plotId, name: "" },
    notes: null,
  };
}

export function PlanDraftRotationsScreen({
  route,
}: PlanDraftRotationsScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { draftPlanId, plotIds } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: t("crop_rotations.plan.title") });
  }, [navigation, t]);

  const { plotPlans, setPlotIds, initializeFromExisting, reset } =
    usePlanCropRotationsStore();
  const { crops, isLoading: cropsLoading } = useCropsQuery();
  const { plots, isLoading: plotsLoading } = useFarmPlotsQuery();
  const { draftPlan, isLoading: draftLoading } = useDraftPlanQuery(draftPlanId);
  const [saving, setSaving] = useState(false);
  const initializedRef = useRef(false);

  // Initialise store from draft plot rotations for the requested plots
  useEffect(() => {
    if (!initializedRef.current && draftPlan) {
      const relevantRotations = draftPlan.plots
        .filter((p) => plotIds.includes(p.plotId))
        .flatMap((p) => p.rotations.map((r) => draftRotationToPlotCropRotation(r, p.plotId)));

      if (relevantRotations.length > 0) {
        initializeFromExisting(plotIds, relevantRotations);
      } else {
        setPlotIds(plotIds);
      }
      initializedRef.current = true;
    }
  }, [draftPlan, plotIds, initializeFromExisting, setPlotIds]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const updateMutation = useUpdateDraftPlanMutation(
    () => {
      setSaving(false);
      reset();
      navigation.dispatch(
        CommonActions.reset({
          index: 3,
          routes: [
            { name: "Home" },
            { name: "FieldCalendar" },
            { name: "DraftPlans" },
            { name: "DraftPlanDetail", params: { draftPlanId } },
          ],
        }),
      );
    },
    () => {
      setSaving(false);
    },
  );

  const selectedPlots = useMemo(() => {
    if (!plots) return [];
    return plots.filter((p) => plotIds.includes(p.id));
  }, [plots, plotIds]);

  function handleSave() {
    setSaving(true);

    // Full replace — pass ALL plots: untouched ones preserved from server state,
    // edited ones replaced with store data.
    const untouchedPlots = (draftPlan?.plots ?? [])
      .filter((p) => !plotIds.includes(p.plotId))
      .map((p) => ({
        plotId: p.plotId,
        rotations: p.rotations.map((r) => ({
          cropId: r.cropId,
          fromDate: r.fromDate,
          toDate: r.toDate,
          sowingDate: r.sowingDate ?? undefined,
          recurrenceInterval: r.recurrence?.interval,
          recurrenceUntil: r.recurrence?.until ?? undefined,
        })),
      }));

    const editedPlots = plotPlans.map((plan) => ({
      plotId: plan.plotId,
      rotations: plan.rotations
        .filter((r) => !!r.cropId)
        .map((r) => ({
          cropId: r.cropId!,
          fromDate: r.fromDate.toISOString(),
          toDate: r.toDate.toISOString(),
          recurrenceInterval: r.recurrence?.interval,
          recurrenceUntil: r.recurrence?.until?.toISOString(),
        })),
    }));

    updateMutation.mutate({
      draftPlanId,
      plots: [...untouchedPlots, ...editedPlots],
    });
  }

  if (cropsLoading || plotsLoading || draftLoading || !crops || !plots) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PlotRotationsEditor
      crops={crops}
      selectedPlots={selectedPlots}
      saving={saving}
      // No plotCropRotations — skips past-rotation warning check in draft mode
      onSave={handleSave}
      onNavigateToCreateCrop={() => navigation.navigate("CreateCrop")}
    />
  );
}
