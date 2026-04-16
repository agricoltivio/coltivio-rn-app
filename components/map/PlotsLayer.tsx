import { Plot } from "@/api/plots.api";
import { hexToRgba, indexToDistinctColor, plotIdToColor } from "@/theme/theme";
import { GeoJSONSource, Layer, type LngLat } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTheme } from "styled-components/native";

export type PlotColorMode = "plot" | "crop" | "usage" | "cutting";

// Determines the fill color for a single plot based on the active color mode.
export function resolvePlotColor(plot: Plot, mode: PlotColorMode): string {
  switch (mode) {
    case "crop":
      return plotIdToColor(plot.currentCropRotation?.cropId ?? "__no_crop__");
    case "usage":
      return plotIdToColor(String(plot.usage ?? "__no_usage__"));
    case "cutting": {
      if (!plot.cuttingDate) return plotIdToColor("__no_cutting__");
      return indexToDistinctColor(new Date(plot.cuttingDate).getMonth());
    }
    default:
      return plotIdToColor(plot.id);
  }
}

type PlotsLayerProps = {
  plots: Plot[];
  selectedPlotIds?: string[];
  /** Color override for selected plots. Defaults to theme success color. */
  selectedColor?: string;
  onPlotPress?: (event: {
    stopPropagation(): void;
    nativeEvent: { features: GeoJSON.Feature[]; lngLat: LngLat };
  }) => void;
  /** Show name labels for all plots when zoomed in (minZoom 14). One label per plot. */
  showZoomLabels?: boolean;
  /** Unique suffix for source/layer IDs to avoid conflicts when multiple PlotsLayers are mounted */
  idSuffix?: string;
  /** Controls how plot fill colors are derived. Defaults to "plot" (per-plot stable color). */
  plotColorMode?: PlotColorMode;
};

export function PlotsLayer({
  plots,
  selectedPlotIds = [],
  selectedColor,
  onPlotPress,
  showZoomLabels = false,
  idSuffix = "",
  plotColorMode = "plot",
}: PlotsLayerProps) {
  const theme = useTheme();
  const resolvedSelectedColor = selectedColor ?? theme.colors.success;

  const featureCollection = useMemo((): GeoJSON.FeatureCollection => {
    return {
      type: "FeatureCollection",
      // Flatten MultiPolygons into individual Polygon features so each sub-polygon
      // gets its own line layer outline — making internal shared-edge borders always visible.
      // All sub-polygons of the same plot share plotIndex → same color.
      features: plots.flatMap((plot) =>
        plot.geometry.coordinates.map((polygonCoords) => ({
          type: "Feature" as const,
          properties: {
            id: plot.id,
            name: plot.name,
            selected: selectedPlotIds.includes(plot.id) ? 1 : 0,
            color: hexToRgba(
              resolvePlotColor(plot, plotColorMode),
              theme.map.defaultFillAlpha,
            ),
          },
          geometry: { type: "Polygon" as const, coordinates: polygonCoords },
        })),
      ),
    };
  }, [plots, selectedPlotIds, plotColorMode, theme]);

  // One label per plot at the centroid of the full MultiPolygon geometry.
  // Built from the original plots array (not the flattened sub-polygons).
  const labelCollection = useMemo((): GeoJSON.FeatureCollection => {
    if (!showZoomLabels) return { type: "FeatureCollection", features: [] };
    return {
      type: "FeatureCollection",
      features: plots.map((plot) => {
        const centroid = turf.centerOfMass(
          turf.multiPolygon(plot.geometry.coordinates),
        );
        return {
          type: "Feature" as const,
          properties: { name: plot.name },
          geometry: centroid.geometry,
        };
      }),
    };
  }, [plots, showZoomLabels]);

  const selectedFillColor = hexToRgba(
    resolvedSelectedColor,
    theme.map.defaultFillAlpha,
  );

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
              ["get", "color"],
            ],
            "fill-opacity": 1,
          }}
        />
        <Layer
          type="line"
          id={`plots-stroke${sid}`}
          paint={{
            "line-color": [
              "case",
              ["==", ["get", "selected"], 1],
              theme.colors.warning,
              "white",
            ],
            "line-width": [
              "case",
              ["==", ["get", "selected"], 1],
              3,
              theme.map.defaultStrokeWidth,
            ],
          }}
        />
      </GeoJSONSource>

      {showZoomLabels ? (
        <GeoJSONSource id={`plots-labels${sid}`} data={labelCollection}>
          <Layer
            type="symbol"
            id={`plots-label-text${sid}`}
            layout={{
              "text-field": ["get", "name"],
              "text-size": 13,
              "text-anchor": "center",
              "text-allow-overlap": false,
              "text-ignore-placement": false,
            }}
            paint={{
              "text-color": "#FFFFFF",
              "text-halo-color": "#000000",
              "text-halo-width": 2,
              // fade in at zoom 14, invisible below
              "text-opacity": ["step", ["zoom"], 0, 14, 1],
            }}
          />
        </GeoJSONSource>
      ) : null}
    </>
  );
}
