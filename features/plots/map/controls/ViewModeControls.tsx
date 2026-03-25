import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

type ViewModeControlsProps = {
  onDelete: () => void;
};

export function ViewModeControls({ onDelete }: ViewModeControlsProps) {
  const theme = useTheme();
  const {
    mode,
    dispatch,
    plots,
    controlsExpanded,
    setControlsExpanded,
    navigation,
  } = usePlotsMapContext();

  if (mode.type !== "view") return null;

  const selectedPlotId = mode.selectedPlotId;
  const selectedPlot = selectedPlotId
    ? plots.find((p) => p.id === selectedPlotId)
    : undefined;
  const hasSelection = !!selectedPlot;

  return (
    <MapControls expanded={controlsExpanded} onToggle={setControlsExpanded}>
      {/* Create */}
      <MaterialCommunityIconButton
        style={{
          backgroundColor: theme.colors.accent,
          opacity: hasSelection ? 0.4 : 1,
        }}
        type="accent"
        color="black"
        iconSize={30}
        icon="pencil-plus-outline"
        disabled={hasSelection}
        onPress={() => dispatch({ type: "ENTER_CREATE" })}
      />
      {/* Split */}
      <MaterialCommunityIconButton
        style={{
          backgroundColor: theme.colors.accent,
          opacity: hasSelection ? 1 : 0.4,
        }}
        type="accent"
        color="black"
        iconSize={30}
        icon="scissors-cutting"
        disabled={!hasSelection}
        onPress={() => {
          if (selectedPlot) {
            dispatch({
              type: "ENTER_SPLIT",
              plotId: selectedPlot.id,
              initialGeometry: selectedPlot.geometry,
            });
          }
        }}
      />
      {/* Merge */}
      <MaterialCommunityIconButton
        style={{
          backgroundColor: theme.colors.accent,
          opacity: hasSelection ? 1 : 0.4,
        }}
        type="accent"
        color="black"
        iconSize={30}
        icon="table-merge-cells"
        disabled={!hasSelection}
        onPress={() => {
          if (selectedPlot) {
            dispatch({
              type: "ENTER_MERGE",
              primaryPlotId: selectedPlot.id,
            });
          }
        }}
      />
      {/* Adjust */}
      <MaterialCommunityIconButton
        style={{
          backgroundColor: theme.colors.accent,
          opacity: hasSelection ? 1 : 0.4,
        }}
        type="accent"
        color="black"
        iconSize={30}
        icon="square-edit-outline"
        disabled={!hasSelection}
        onPress={() => {
          if (selectedPlot) {
            dispatch({ type: "ENTER_ADJUST", plotId: selectedPlot.id });
          }
        }}
      />
      {/* Delete */}
      <MaterialCommunityIconButton
        style={{
          backgroundColor: theme.colors.accent,
          opacity: hasSelection ? 1 : 0.4,
        }}
        type="accent"
        color="red"
        iconSize={30}
        icon="delete-outline"
        disabled={!hasSelection}
        onPress={onDelete}
      />
      {/* Info */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="information-outline"
        onPress={() => navigation.navigate("PlotsMapOnboarding")}
      />
    </MapControls>
  );
}
