import {
  GeoJSONSource,
  Layer,
} from "@maplibre/maplibre-react-native";
import React, { useMemo } from "react";

type LabelEntry = {
  center: [number, number];
  text: string;
  hidden?: boolean;
};

type LabelLayerProps = {
  labels: LabelEntry[];
  /** Unique suffix for source/layer IDs to avoid conflicts */
  idSuffix?: string;
};

export function LabelLayer({ labels, idSuffix = "" }: LabelLayerProps) {
  const data = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: labels
        .filter((l) => !l.hidden)
        .map((label) => ({
          type: "Feature",
          properties: { text: label.text },
          geometry: { type: "Point", coordinates: label.center },
        })),
    }),
    [labels],
  );

  const sid = idSuffix ? `-${idSuffix}` : "";

  return (
    <GeoJSONSource id={`labels${sid}`} data={data}>
      <Layer
        type="symbol"
        id={`labels-text${sid}`}
        layout={{
          "text-field": ["get", "text"],
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
  );
}
