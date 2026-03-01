import { PlotsLayer } from "@/components/map/PlotsLayer";
import React, { useCallback } from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export function MergeModeLayers() {
  const theme = useTheme();
  const { mode, dispatch, plots } = usePlotsMapContext();

  const selectedPlotIds = mode.type === "merge" ? mode.selectedPlotIds : [];

  // Only show plots with actual geometry
  const visiblePlots = plots.filter((plot) => plot.size > 0);

  const handlePlotPress = useCallback(
    (event: { stopPropagation(): void; nativeEvent: { features: GeoJSON.Feature[] } }) => {
      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const plotId = feature?.properties?.id;
      if (typeof plotId === "string") {
        dispatch({ type: "TOGGLE_MERGE_PLOT", plotId });
      }
    },
    [dispatch],
  );

  if (mode.type !== "merge") return null;

  return (
    <PlotsLayer
      plots={visiblePlots}
      selectedPlotIds={selectedPlotIds}
      selectedColor={theme.colors.secondary}
      onPlotPress={handlePlotPress}
      showLabels
    />
  );
}
