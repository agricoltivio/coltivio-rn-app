import { Meadow } from "@/api/meadows.api";
import {
  GeoJSONSource,
  Images,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { useTheme } from "styled-components/native";

const STRIPE_PATTERN_ID = "meadow-stripes";
const stripePattern = require("@/assets/map/meadow-stripes.png");

type MeadowsLayerProps = {
  meadows: Meadow[];
  selectedMeadowId?: string | null;
  /** Hidden from the layer, e.g. the meadow currently being edited */
  excludeMeadowId?: string;
  onMeadowPress?: (meadowId: string) => void;
};

export function MeadowsLayer({
  meadows,
  selectedMeadowId,
  excludeMeadowId,
  onMeadowPress,
}: MeadowsLayerProps) {
  const theme = useTheme();

  const visibleMeadows = useMemo(
    () => meadows.filter((meadow) => meadow.id !== excludeMeadowId),
    [meadows, excludeMeadowId],
  );

  const featureCollection = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: visibleMeadows.map((meadow) => ({
        type: "Feature",
        properties: {
          id: meadow.id,
          selected: meadow.id === selectedMeadowId ? 1 : 0,
        },
        geometry: meadow.geometry,
      })),
    }),
    [visibleMeadows, selectedMeadowId],
  );

  const labelCollection = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: visibleMeadows.map((meadow) => ({
        type: "Feature",
        properties: { name: meadow.name },
        geometry: turf.centerOfMass(
          turf.multiPolygon(meadow.geometry.coordinates),
        ).geometry,
      })),
    }),
    [visibleMeadows],
  );

  function handlePress(event: {
    stopPropagation(): void;
    nativeEvent: { features: GeoJSON.Feature[]; lngLat: LngLat };
  }) {
    if (!onMeadowPress) return;
    event.stopPropagation();
    // Meadows never overlap, so the first hit is the tapped meadow
    const meadowId = event.nativeEvent.features[0]?.properties?.id;
    if (typeof meadowId === "string") onMeadowPress(meadowId);
  }

  return (
    <>
      <Images images={{ [STRIPE_PATTERN_ID]: stripePattern }} />
      <GeoJSONSource
        id="meadows"
        data={featureCollection}
        onPress={onMeadowPress ? handlePress : undefined}
      >
        <Layer
          type="fill"
          id="meadows-fill"
          paint={{ "fill-pattern": STRIPE_PATTERN_ID }}
        />
        <Layer
          type="line"
          id="meadows-stroke"
          paint={{
            "line-color": [
              "case",
              ["==", ["get", "selected"], 1],
              theme.colors.warning,
              theme.colors.secondary,
            ],
            "line-width": ["case", ["==", ["get", "selected"], 1], 4, 2.5],
          }}
        />
      </GeoJSONSource>
      <GeoJSONSource id="meadows-labels" data={labelCollection}>
        <Layer
          type="symbol"
          id="meadows-label-text"
          layout={{
            "text-field": ["get", "name"],
            "text-size": 14,
            "text-anchor": "center",
            "text-allow-overlap": false,
          }}
          paint={{
            "text-color": "#FFFFFF",
            "text-halo-color": theme.colors.primary,
            "text-halo-width": 2,
          }}
        />
      </GeoJSONSource>
    </>
  );
}
