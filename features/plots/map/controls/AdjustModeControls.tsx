import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { usePlotsMapContext } from "../plots-map-mode";
import { AdjustModeLayersHandle } from "../layers/AdjustModeLayers";

type AdjustModeControlsProps = {
  adjustLayersRef: React.RefObject<AdjustModeLayersHandle | null>;
};

export function AdjustModeControls({
  adjustLayersRef,
}: AdjustModeControlsProps) {
  const { mode, dispatch } = usePlotsMapContext();

  if (mode.type !== "adjust") return null;

  return (
    <MapControls>
      {/* Cancel */}
      <MaterialCommunityIconButton
        type="accent"
        color="red"
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
    </MapControls>
  );
}
