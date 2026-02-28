import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export function MergeModeControls() {
  const theme = useTheme();
  const { mode, dispatch, navigation } = usePlotsMapContext();

  if (mode.type !== "merge") return null;

  const { selectedPlotIds, primaryPlotId } = mode;
  const canConfirm = selectedPlotIds.length >= 2;

  return (
    <MapControls>
      {/* Cancel */}
      <MaterialCommunityIconButton
        type="accent"
        color="black"
        iconSize={30}
        icon="close-circle-outline"
        onPress={() => dispatch({ type: "EXIT_MODE" })}
      />
      {/* Confirm */}
      <MaterialCommunityIconButton
        type="accent"
        color={canConfirm ? "green" : "gray"}
        iconSize={30}
        icon="check-circle-outline"
        disabled={!canConfirm}
        onPress={() => {
          navigation.navigate("MergePlotSummary", {
            plotIds: Array.from(selectedPlotIds),
            primaryPlotId,
          });
        }}
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
