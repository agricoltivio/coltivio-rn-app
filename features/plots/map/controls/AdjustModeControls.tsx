import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { Text } from "react-native";
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
  const { mode, dispatch, navigation, plots } = usePlotsMapContext();

  if (mode.type !== "adjust") return null;

  const plot = plots.find((p) => p.id === mode.plotId);
  const totalRings = plot?.geometry.coordinates.length ?? 1;
  const isLastRing = mode.activeRingIndex >= totalRings - 1;
  const hasMultipleRings = totalRings > 1;

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
      {/* Ring counter — only shown for multipolygons */}
      {hasMultipleRings && (
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {mode.activeRingIndex + 1}/{totalRings}
        </Text>
      )}
      {/* Confirm current ring or advance to next */}
      <MaterialCommunityIconButton
        type="accent"
        color="green"
        iconSize={30}
        icon={
          isLastRing ? "check-circle-outline" : "arrow-right-circle-outline"
        }
        onPress={() => adjustLayersRef.current?.handleConfirm()}
      />
      {/* Info */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="information-outline"
        onPress={() => navigation.navigate("AdjustPlotOnboarding")}
      />
    </MapControls>
  );
}
