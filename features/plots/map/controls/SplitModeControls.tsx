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
  const { mode, dispatch, plots, drawingRef, navigation } =
    usePlotsMapContext();
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

  function cancelDrawing() {
    drawingRef.current?.reset();
    dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
  }

  // Polygon draw phase — show cancel, undo, disabled cut, disabled checkmark
  if (activeToolMode === "polygon") {
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={cancelDrawing}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="gray"
          iconSize={30}
          icon="content-cut"
          disabled
        />
      </MapControls>
    );
  }

  // Polygon edit phase — polygon closed, user can adjust vertices then cut
  if (activeToolMode === "polygon-edit") {
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={cancelDrawing}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="green"
          iconSize={30}
          icon="content-cut"
          onPress={() => splitLayersRef.current?.handlePolygonCut()}
        />
      </MapControls>
    );
  }

  // Polyline tool — show cancel, undo, cut, disabled checkmark
  if (activeToolMode === "polyline") {
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={cancelDrawing}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="green"
          iconSize={30}
          icon="content-cut"
          onPress={() => splitLayersRef.current?.handlePolylineCut()}
        />
      </MapControls>
    );
  }

  // Extract mode — just cancel
  if (activeToolMode === "extract") {
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="black"
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
      {/* Cancel — exit split mode */}
      <MaterialCommunityIconButton
        type="accent"
        color="black"
        iconSize={30}
        icon="close-circle-outline"
        onPress={() => {
          splitPlotStore.reset();
          dispatch({ type: "EXIT_MODE" });
        }}
      />
      {/* Polyline split tool */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="vector-polyline-plus"
        onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "polyline" })}
      />
      {/* Polygon cut tool */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="vector-polygon"
        onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "polygon" })}
      />
      {/* Extract sub-polygon — only for MultiPolygons with >1 ring */}
      {currentPolygons.some((p) => p.coordinates.length > 1) && (
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="vector-difference-ba"
          onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "extract" })}
        />
      )}
      {/* Confirm — navigate to summary when there are multiple polygons */}
      <MaterialCommunityIconButton
        type="accent"
        color={hasMultiplePolygons ? "green" : "gray"}
        iconSize={30}
        icon="check-circle-outline"
        disabled={!hasMultiplePolygons}
        onPress={handleDone}
      />
      {/* Info */}
      <MaterialCommunityIconButton
        style={{ backgroundColor: theme.colors.accent }}
        type="accent"
        color="black"
        iconSize={30}
        icon="information-outline"
        onPress={() => navigation.navigate("SplitPlotOnboarding")}
      />
    </MapControls>
  );
}
