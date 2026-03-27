import { useEffect, useMemo, useState, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import {
  usePlanCropRotationsStore,
} from "./plan-crop-rotations.store";
import { useCropsQuery } from "@/features/crops/crops.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import {
  useCropRotationsByPlotIdsQuery,
  usePlanCropRotationsMutation,
} from "../crop-rotations.hooks";
import { PlanCropRotationsScreenProps } from "../navigation/crop-rotations-routes.d";
import { addYears, subYears } from "date-fns";
import { PlotRotationsEditor } from "./components/PlotRotationsEditor";

export function PlanCropRotationsScreen({
  route,
}: PlanCropRotationsScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const plotIdsFromParams = route.params.plotIds!;
  const previousScreen = route.params.previousScreen;

  useEffect(() => {
    navigation.setOptions({ title: t("crop_rotations.plan.title") });
  }, [navigation, t]);

  const {
    plotPlans,
    setPlotIds,
    initializeFromExisting,
    reset,
  } = usePlanCropRotationsStore();
  const { crops, isLoading: cropsLoading } = useCropsQuery();
  const { plots, isLoading: plotsLoading } = useFarmPlotsQuery();
  const [saving, setSaving] = useState(false);
  const initializedRef = useRef(false);

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

  useEffect(() => {
    if (!initializedRef.current && plotCropRotations) {
      if (plotCropRotations.length > 0) {
        initializeFromExisting(plotIdsFromParams, plotCropRotations);
      } else {
        setPlotIds(plotIdsFromParams);
      }
      initializedRef.current = true;
    }
  }, [plotCropRotations, plotIdsFromParams, initializeFromExisting, setPlotIds]);

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

  const selectedPlots = useMemo(() => {
    if (!plots) return [];
    return plots.filter((p) => selectedPlotIds.includes(p.id));
  }, [plots, selectedPlotIds]);

  function handleSave() {
    setSaving(true);
    planMutation.mutate({
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
    });
  }

  if (cropsLoading || plotsLoading || rotationsLoading || !crops || !plots) {
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
      plotCropRotations={plotCropRotations}
      onSave={handleSave}
      onNavigateToCreateCrop={() => navigation.navigate("CreateCrop")}
    />
  );
}
