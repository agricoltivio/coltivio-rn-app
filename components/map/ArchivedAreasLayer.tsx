import { Meadow } from "@/api/meadows.api";
import { Plot } from "@/api/plots.api";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTheme } from "styled-components/native";

type ArchivedAreasLayerProps = {
  plots: Plot[];
  meadows: Meadow[];
  selectedId?: string | null;
  onPress?: (area: { kind: "plot" | "meadow"; id: string }) => void;
};

// Archived plots and meadows: a grey veil with a dashed outline, so they read as
// "no longer in use" next to the active layers
export function ArchivedAreasLayer({
  plots,
  meadows,
  selectedId,
  onPress,
}: ArchivedAreasLayerProps) {
  const theme = useTheme();

  const featureCollection = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: [
        ...plots.map(
          (plot): GeoJSON.Feature => ({
            type: "Feature",
            properties: {
              id: plot.id,
              kind: "plot",
              selected: plot.id === selectedId ? 1 : 0,
            },
            geometry: plot.geometry,
          }),
        ),
        ...meadows.map(
          (meadow): GeoJSON.Feature => ({
            type: "Feature",
            properties: {
              id: meadow.id,
              kind: "meadow",
              selected: meadow.id === selectedId ? 1 : 0,
            },
            geometry: meadow.geometry,
          }),
        ),
      ],
    }),
    [plots, meadows, selectedId],
  );

  const labelCollection = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: [...plots, ...meadows].map((area) => ({
        type: "Feature",
        properties: { name: area.name },
        geometry: turf.centerOfMass(
          turf.multiPolygon(area.geometry.coordinates),
        ).geometry,
      })),
    }),
    [plots, meadows],
  );

  function handlePress(event: {
    stopPropagation(): void;
    nativeEvent: { features: GeoJSON.Feature[]; lngLat: LngLat };
  }) {
    if (!onPress) return;
    event.stopPropagation();
    const properties = event.nativeEvent.features[0]?.properties;
    const id = properties?.id;
    const kind = properties?.kind;
    if (typeof id === "string" && (kind === "plot" || kind === "meadow")) {
      onPress({ kind, id });
    }
  }

  return (
    <>
      <GeoJSONSource
        id="archived-areas"
        data={featureCollection}
        onPress={onPress ? handlePress : undefined}
      >
        {/* Grey veil: reads as "no longer in use", distinct from the white of new
            plots being drawn and the yellow of a selection */}
        <Layer
          type="fill"
          id="archived-areas-fill"
          paint={{ "fill-color": theme.colors.gray3, "fill-opacity": 0.45 }}
        />
        {/* Dark casing under the dashed outline, so it stays visible on light ground */}
        <Layer
          type="line"
          id="archived-areas-casing"
          paint={{
            "line-color": theme.colors.gray0,
            "line-opacity": 0.35,
            "line-width": ["case", ["==", ["get", "selected"], 1], 4.5, 2.5],
          }}
        />
        <Layer
          type="line"
          id="archived-areas-stroke"
          paint={{
            "line-color": [
              "case",
              ["==", ["get", "selected"], 1],
              theme.colors.warning,
              theme.colors.white,
            ],
            "line-width": ["case", ["==", ["get", "selected"], 1], 3, 1.5],
            "line-dasharray": [2, 1.5],
          }}
        />
      </GeoJSONSource>
      <GeoJSONSource id="archived-areas-labels" data={labelCollection}>
        <Layer
          type="symbol"
          id="archived-areas-label-text"
          layout={{
            "text-field": ["get", "name"],
            "text-size": 13,
            "text-anchor": "center",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "#FFFFFF",
            "text-halo-color": theme.colors.gray0,
            "text-halo-width": 2,
          }}
        />
      </GeoJSONSource>
    </>
  );
}
