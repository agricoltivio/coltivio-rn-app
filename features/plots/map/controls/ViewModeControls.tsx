import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import {
  useDeleteMeadowMutation,
  useMeadowsQuery,
  useUpdateMeadowMutation,
} from "@/features/animals/meadows.hooks";
import { MapControls } from "@/features/map/overlays/MapControls";
import { usePermissions } from "@/features/user/users.hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

type ViewModeControlsProps = {
  onDelete: () => void;
};

export function ViewModeControls({ onDelete }: ViewModeControlsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    mode,
    dispatch,
    plots,
    controlsExpanded,
    setControlsExpanded,
    navigation,
    selectedMeadowId,
    setSelectedMeadowId,
    archivedMeadows,
  } = usePlotsMapContext();
  const { canWrite } = usePermissions();
  const { meadows } = useMeadowsQuery();
  // Archived meadows leave the map like deleted ones, but keep their data
  const deleteMeadowMutation = useDeleteMeadowMutation(
    () => setSelectedMeadowId(null),
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );
  const archiveMeadowMutation = useUpdateMeadowMutation(
    () => setSelectedMeadowId(null),
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );

  if (mode.type !== "view") return null;

  // A selected meadow switches the tools to meadow editing
  if (selectedMeadowId) {
    if (!canWrite("animals")) return null;
    // Archived meadows are read-only on the map; restore them from the drawer
    if (archivedMeadows.some((meadow) => meadow.id === selectedMeadowId)) {
      return null;
    }
    return (
      <MapControls expanded={controlsExpanded} onToggle={setControlsExpanded}>
        {/* Adjust vertices */}
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.surface }}
          type="accent"
          color="black"
          iconSize={30}
          icon="square-edit-outline"
          onPress={() =>
            dispatch({
              type: "ENTER_MEADOW_ADJUST",
              meadowId: selectedMeadowId,
            })
          }
        />
        {/* Delete */}
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.surface }}
          type="accent"
          color="red"
          iconSize={30}
          icon="delete-outline"
          disabled={
            deleteMeadowMutation.isPending || archiveMeadowMutation.isPending
          }
          onPress={() => {
            const meadowName =
              meadows?.find((meadow) => meadow.id === selectedMeadowId)?.name ??
              "";
            Alert.alert(
              t("archive.meadow_delete_title", { name: meadowName }),
              t("archive.meadow_delete_warning"),
              [
                { text: t("buttons.cancel"), style: "cancel" },
                {
                  text: t("archive.archive"),
                  // Same confirmation as archiving from the edit screen
                  onPress: () =>
                    Alert.alert(
                      t("archive.meadow_confirm_title", { name: meadowName }),
                      t("archive.meadow_info"),
                      [
                        { text: t("buttons.cancel"), style: "cancel" },
                        {
                          text: t("archive.archive"),
                          onPress: () =>
                            archiveMeadowMutation.mutate({
                              id: selectedMeadowId,
                              archived: true,
                            }),
                        },
                      ],
                    ),
                },
                {
                  text: t("buttons.delete"),
                  style: "destructive",
                  onPress: () => deleteMeadowMutation.mutate(selectedMeadowId),
                },
              ],
            );
          }}
        />
      </MapControls>
    );
  }

  const canEditPlots = canWrite("field_calendar");
  const canEditMeadows = canWrite("animals");
  // Read-only members see no edit controls on the map
  if (!canEditPlots && !canEditMeadows) return null;

  const selectedPlotId = mode.selectedPlotId;
  const selectedPlot = selectedPlotId
    ? plots.find((p) => p.id === selectedPlotId)
    : undefined;
  const hasSelection = !!selectedPlot;

  return (
    <MapControls expanded={controlsExpanded} onToggle={setControlsExpanded}>
      {/* Create — the chooser lets the user pick plot or meadow */}
      {!hasSelection && (
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.surface }}
          type="accent"
          color="black"
          iconSize={30}
          icon="pencil-plus-outline"
          onPress={() =>
            dispatch({
              type: "ENTER_CREATE",
              target: canEditPlots ? "plot" : "meadow",
            })
          }
        />
      )}
      {/* Plot tools — only while a plot is selected */}
      {canEditPlots && selectedPlot && (
        <>
          {/* Split */}
          <MaterialCommunityIconButton
            style={{ backgroundColor: theme.colors.surface }}
            type="accent"
            color="black"
            iconSize={30}
            icon="scissors-cutting"
            onPress={() =>
              dispatch({
                type: "ENTER_SPLIT",
                plotId: selectedPlot.id,
                initialGeometry: selectedPlot.geometry,
              })
            }
          />
          {/* Merge */}
          <MaterialCommunityIconButton
            style={{ backgroundColor: theme.colors.surface }}
            type="accent"
            color="black"
            iconSize={30}
            icon="table-merge-cells"
            onPress={() =>
              dispatch({ type: "ENTER_MERGE", primaryPlotId: selectedPlot.id })
            }
          />
          {/* Adjust */}
          <MaterialCommunityIconButton
            style={{ backgroundColor: theme.colors.surface }}
            type="accent"
            color="black"
            iconSize={30}
            icon="square-edit-outline"
            onPress={() =>
              dispatch({ type: "ENTER_ADJUST", plotId: selectedPlot.id })
            }
          />
          {/* Delete */}
          <MaterialCommunityIconButton
            style={{ backgroundColor: theme.colors.surface }}
            type="accent"
            color="red"
            iconSize={30}
            icon="delete-outline"
            onPress={onDelete}
          />
        </>
      )}
      {/* Info */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.surface }}
        type="accent"
        color="black"
        iconSize={30}
        icon="information-outline"
        onPress={() => navigation.navigate("PlotsMapOnboarding")}
      />
    </MapControls>
  );
}
