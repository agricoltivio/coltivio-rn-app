import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { AdjustModeLayersHandle } from "../layers/AdjustModeLayers";

type AdjustModeControlsProps = {
  adjustLayersRef: React.RefObject<AdjustModeLayersHandle | null>;
};

export function AdjustModeControls({
  adjustLayersRef,
}: AdjustModeControlsProps) {
  const theme = useTheme();
  const { mode, dispatch, navigation } = usePlotsMapContext();

  if (mode.type !== "adjust") return null;

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
        color="green"
        iconSize={30}
        icon="check-circle-outline"
        onPress={() => adjustLayersRef.current?.handleConfirm()}
      />
      {/* Info */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="information-outline"
        onPress={() => navigation.navigate("MapDrawOnboarding", { variant: "edit" })}
      />
    </MapControls>
  );
}
