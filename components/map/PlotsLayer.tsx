import { Plot } from "@/api/plots.api";
import { hexToRgba, indexToDistinctColor } from "@/theme/theme";
import {
  GeoJSONSource,
  Layer,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTheme } from "styled-components/native";

type PlotsLayerProps = {
  plots: Plot[];
  selectedPlotIds?: string[];
  /** Color override for selected plots. Defaults to theme success color. */
  selectedColor?: string;
  onPlotPress?: (event: {
    stopPropagation(): void;
    nativeEvent: { features: GeoJSON.Feature[] };
  }) => void;
  showLabels?: boolean;
  /** Unique suffix for source/layer IDs to avoid conflicts when multiple PlotsLayers are mounted */
  idSuffix?: string;
};

export function PlotsLayer({
  plots,
  selectedPlotIds = [],
  selectedColor,
  onPlotPress,
  showLabels = false,
  idSuffix = "",
}: PlotsLayerProps) {
  const theme = useTheme();
  const resolvedSelectedColor = selectedColor ?? theme.colors.success;

  const featureCollection = useMemo((): GeoJSON.FeatureCollection => {
    return {
      type: "FeatureCollection",
      features: plots.map((plot, index) => ({
        type: "Feature",
        properties: {
          id: plot.id,
          name: plot.name,
          selected: selectedPlotIds.includes(plot.id) ? 1 : 0,
          color: indexToDistinctColor(index),
        },
        geometry: plot.geometry,
      })),
    };
  }, [plots, selectedPlotIds]);

  const labelCollection = useMemo((): GeoJSON.FeatureCollection => {
    if (!showLabels) return { type: "FeatureCollection", features: [] };
    return {
      type: "FeatureCollection",
      features: plots
        .filter((plot) => selectedPlotIds.includes(plot.id))
        .map((plot) => {
          const centroid = turf.centroid(turf.multiPolygon(plot.geometry.coordinates));
          return {
            type: "Feature",
            properties: { name: plot.name },
            geometry: centroid.geometry,
          };
        }),
    };
  }, [plots, selectedPlotIds, showLabels]);

  const fillColor = hexToRgba(theme.map.defaultFillColor, theme.map.defaultFillAlpha);
  const selectedFillColor = hexToRgba(resolvedSelectedColor, theme.map.defaultFillAlpha);

  const sid = idSuffix ? `-${idSuffix}` : "";

  return (
    <>
      <GeoJSONSource
        id={`plots${sid}`}
        data={featureCollection}
        onPress={onPlotPress}
      >
        <Layer
          type="fill"
          id={`plots-fill${sid}`}
          paint={{
            "fill-color": [
              "case",
              ["==", ["get", "selected"], 1],
              selectedFillColor,
              fillColor,
            ],
            "fill-opacity": 1,
          }}
        />
        <Layer
          type="line"
          id={`plots-stroke${sid}`}
          paint={{
            "line-color": "white",
            "line-width": theme.map.defaultStrokeWidth,
          }}
        />
      </GeoJSONSource>

      {showLabels ? (
        <GeoJSONSource id={`plots-labels${sid}`} data={labelCollection}>
          <Layer
            type="symbol"
            id={`plots-label-text${sid}`}
            layout={{
              "text-field": ["get", "name"],
              "text-size": 14,
              "text-anchor": "center",
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            }}
            paint={{
              "text-color": "#FFFFFF",
              "text-halo-color": "#000000",
              "text-halo-width": 2,
            }}
          />
        </GeoJSONSource>
      ) : null}
    </>
  );
}
