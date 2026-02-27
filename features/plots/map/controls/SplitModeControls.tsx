import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import { round } from "@/utils/math";
import * as turf from "@turf/turf";
import React from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { SubPlotData, useSplitPlotStore } from "../../split-plot.store";
import { SplitModeLayersHandle } from "../layers/SplitModeLayers";

type SplitModeControlsProps = {
  splitLayersRef: React.RefObject<SplitModeLayersHandle | null>;
};

export function SplitModeControls({ splitLayersRef }: SplitModeControlsProps) {
  const theme = useTheme();
  const { mode, dispatch, plots, drawingRef, navigation } = usePlotsMapContext();
  const splitPlotStore = useSplitPlotStore();

  if (mode.type !== "split") return null;

  const { activeToolMode, currentPolygons, plotId } = mode;
  const plot = plots.find((p) => p.id === plotId);
  const hasMultiplePolygons = currentPolygons.length >= 2;

  function handleDone() {
    if (currentPolygons.length < 2 || !plot) return;
    const subPlots: SubPlotData[] = currentPolygons.map((geom) => ({
      geometry: geom,
      size: round(turf.area(geom), 0),
    }));
    splitPlotStore.setData(subPlots, plot.name);
    navigation.navigate("SplitPlotSummary", { plotId });
  }

  // When a drawing tool is active, show drawing-specific controls
  if (activeToolMode === "polyline" || activeToolMode === "polygon") {
    return (
      <MapControls>
        {/* Cancel — exit tool back to tool selection */}
        <MaterialCommunityIconButton
          type="accent"
          color="red"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => {
            drawingRef.current?.reset();
            dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
          }}
        />
        {/* Undo */}
        <MaterialCommunityIconButton
          type="accent"
          color="white"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        {/* Cut (polyline mode) */}
        {activeToolMode === "polyline" && (
          <MaterialCommunityIconButton
            type="accent"
            color="green"
            iconSize={30}
            icon="content-cut"
            onPress={() => splitLayersRef.current?.handlePolylineCut()}
          />
        )}
      </MapControls>
    );
  }

  // Extract mode controls
  if (activeToolMode === "extract") {
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="red"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "none" })}
        />
      </MapControls>
    );
  }

  // Tool selection mode (no active tool)
  return (
    <MapControls>
      {/* Cancel */}
      <MaterialCommunityIconButton
        type="accent"
        color="red"
        iconSize={30}
        icon="close-circle-outline"
        onPress={() => {
          splitPlotStore.reset();
          dispatch({ type: "EXIT_MODE" });
        }}
      />
      {/* Polyline tool */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="vector-polyline-plus"
        onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "polyline" })}
      />
      {/* Polygon tool */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="vector-polygon"
        onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "polygon" })}
      />
      {/* Extract tool — only for MultiPolygons with >1 sub-polygon */}
      {currentPolygons.length === 1 && currentPolygons[0].coordinates.length > 1 && (
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="vector-difference-ba"
          onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "extract" })}
        />
      )}
      {/* Confirm (green checkmark) */}
      {hasMultiplePolygons && (
        <MaterialCommunityIconButton
          type="accent"
          color="green"
          iconSize={30}
          icon="check-circle-outline"
          onPress={handleDone}
        />
      )}
    </MapControls>
  );
}
