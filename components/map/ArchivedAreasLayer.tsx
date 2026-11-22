import { Meadow } from "@/api/meadows.api";
import { Plot } from "@/api/plots.api";
import {
  GeoJSONSource,
  type GeoJSONSourceRef,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo, useRef } from "react";
import { useSelectedFeatureState } from "./useSelectedFeatureState";
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
            // Feature id for the selection state
            id: plot.id,
            properties: { id: plot.id, kind: "plot" },
            geometry: plot.geometry,
          }),
        ),
        ...meadows.map(
          (meadow): GeoJSON.Feature => ({
            type: "Feature",
            id: meadow.id,
            properties: { id: meadow.id, kind: "meadow" },
            geometry: meadow.geometry,
          }),
        ),
      ],
    }),
    [plots, meadows],
  );

  const sourceRef = useRef<GeoJSONSourceRef>(null);
  const selectedIds = useMemo(
    () => (selectedId ? [selectedId] : []),
    [selectedId],
  );
  useSelectedFeatureState(sourceRef, selectedIds, featureCollection);

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
        ref={sourceRef}
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
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              4.5,
              2.5,
            ],
          }}
        />
        <Layer
          type="line"
          id="archived-areas-stroke"
          paint={{
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              theme.colors.warning,
              theme.colors.white,
            ],
            "line-width": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              3,
              1.5,
            ],
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
