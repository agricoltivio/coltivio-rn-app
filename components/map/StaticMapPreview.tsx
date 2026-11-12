import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  type LngLat,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { hexToRgba } from "@/theme/theme";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "styled-components/native";
import { MapAttribution } from "./MapAttribution";
import { SWISSTOPO_TILE_BOUNDS } from "./swisstopo";

type BaseLayer = "satellite" | "map";

type StaticMapPreviewProps = {
  center: LngLat;
  zoom?: number;
  features: GeoJSON.FeatureCollection;
  height?: number;
};

const TILE_URLS = {
  satellite:
    "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg",
  map: "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
} as const;

// Both base map sources live in the style so they can be limited to the swisstopo coverage (see swisstopo.ts);
// their layers are added below and only toggled
const BASE_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "swisstopo-satellite-preview": {
      type: "raster",
      tiles: [TILE_URLS.satellite],
      tileSize: 256,
      maxzoom: 20,
      bounds: SWISSTOPO_TILE_BOUNDS,
    },
    "swisstopo-map-preview": {
      type: "raster",
      tiles: [TILE_URLS.map],
      tileSize: 256,
      maxzoom: 18,
      bounds: SWISSTOPO_TILE_BOUNDS,
    },
  },
  layers: [],
};

export function StaticMapPreview({
  center,
  zoom = 16,
  features,
  height = 250,
}: StaticMapPreviewProps) {
  const theme = useTheme();
  const [baseLayer] = useState<BaseLayer>("satellite");
  // Features only after the map loaded, so they end up above the base layers (see MapLibreMap)
  const [mapReady, setMapReady] = useState(false);

  const fillColor = hexToRgba(
    theme.map.defaultFillColor,
    theme.map.defaultFillAlpha,
  );

  return (
    <View pointerEvents="box-none" style={[styles.container, { height }]}>
      <Map
        style={styles.map}
        mapStyle={BASE_STYLE}
        dragPan={false}
        attribution={false}
        logo={false}
        onDidFinishLoadingMap={() => setMapReady(true)}
      >
        <Camera
          initialViewState={{
            center,
            zoom,
          }}
        />

        <Layer
          type="raster"
          id="satellite-preview-layer"
          source="swisstopo-satellite-preview"
          layout={{
            visibility: baseLayer === "satellite" ? "visible" : "none",
          }}
        />
        <Layer
          type="raster"
          id="map-preview-layer"
          source="swisstopo-map-preview"
          layout={{
            visibility: baseLayer === "map" ? "visible" : "none",
          }}
        />

        {mapReady && (
          <GeoJSONSource id="preview-features" data={features}>
            <Layer
              type="fill"
              id="preview-fill"
              paint={{
                "fill-color": ["coalesce", ["get", "color"], fillColor],
                "fill-opacity": 1,
              }}
            />
            <Layer
              type="line"
              id="preview-stroke"
              paint={{
                "line-color": "white",
                "line-width": theme.map.defaultStrokeWidth,
              }}
            />
          </GeoJSONSource>
        )}
      </Map>

      <MapAttribution />

      {/* Layer toggle button */}
      {/* <TouchableOpacity
        style={styles.layerToggle}
        onPress={() => setBaseLayer(baseLayer === "satellite" ? "map" : "satellite")}
      >
        <MaterialCommunityIcons
          name={baseLayer === "satellite" ? "map-outline" : "satellite-variant"}
          size={18}
          color="#333"
        />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  layerToggle: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
});
