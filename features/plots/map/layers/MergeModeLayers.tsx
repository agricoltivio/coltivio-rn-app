import { MultiPolygon } from "@/components/map/MultiPolygon";
import { PolygonDrawingTool } from "@/components/map/PolygonDrawingTool";
import { LabelMarker } from "@/features/map/LabelMarker";
import { hexToRgba } from "@/theme/theme";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export function MergeModeLayers() {
  const theme = useTheme();
  const { mode, dispatch, plots } = usePlotsMapContext();

  if (mode.type !== "merge") return null;

  const { selectedPlotIds } = mode;

  const plotsLayer = useMemo(() => {
    return plots
      .filter((plot) => plot.size > 0)
      .flatMap((plot) => {
        const isSelected = selectedPlotIds.includes(plot.id);
        const centroid = turf.centroid(plot.geometry);
        return [
          <MultiPolygon
            key={plot.id}
            polygon={plot.geometry}
            strokeWidth={theme.map.defaultStrokeWidth}
            strokeColor="white"
            fillColor={hexToRgba(
              isSelected
                ? theme.colors.secondary
                : theme.map.defaultFillColor,
              theme.map.defaultFillAlpha,
            )}
            tappable
            onPress={() =>
              dispatch({ type: "TOGGLE_MERGE_PLOT", plotId: plot.id })
            }
          />,
          <LabelMarker
            key={`label-${plot.id}`}
            latitude={centroid.geometry.coordinates[1]}
            longitude={centroid.geometry.coordinates[0]}
            text={plot.name}
            hidden={!isSelected}
          />,
        ];
      });
  }, [plots, selectedPlotIds, theme, dispatch]);

  return (
    <>
      {plotsLayer}
      {/* PolygonDrawingTool with showActions=false as in original MergePlotsMapScreen */}
      <PolygonDrawingTool showActions={false} />
    </>
  );
}
