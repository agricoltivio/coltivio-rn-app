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
  const { mode, dispatch, plots, navigation } = usePlotsMapContext();
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

  // When polygon drawing tool is active, it renders its own CommandPalette
  if (activeToolMode === "polygon") return null;

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
      {/* Polyline toggle */}
      {activeToolMode === "none" ? (
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="vector-polyline-plus"
          onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "polyline" })}
        />
      ) : null}
      {/* Polygon toggle */}
      {activeToolMode === "none" ? (
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="vector-polygon"
          onPress={() => dispatch({ type: "SET_SPLIT_TOOL", tool: "polygon" })}
        />
      ) : null}
      {/* Cut (polyline mode) */}
      {activeToolMode === "polyline" ? (
        <MaterialCommunityIconButton
          type="accent"
          color="green"
          iconSize={30}
          icon="content-cut"
          onPress={() => splitLayersRef.current?.handlePolylineCut()}
        />
      ) : null}
      {/* Confirm (green checkmark) */}
      {hasMultiplePolygons && activeToolMode === "none" ? (
        <MaterialCommunityIconButton
          type="accent"
          color="green"
          iconSize={30}
          icon="check-circle-outline"
          onPress={handleDone}
        />
      ) : null}
    </MapControls>
  );
}
