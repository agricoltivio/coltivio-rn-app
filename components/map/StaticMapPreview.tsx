import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  RasterSource,
  type LngLat,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { hexToRgba } from "@/theme/theme";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

type BaseLayer = "satellite" | "map";

type StaticMapPreviewProps = {
  center: LngLat;
  zoom?: number;
  features: GeoJSON.FeatureCollection;
  height?: number;
};

const EMPTY_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [],
};

const TILE_URLS = {
  satellite:
    "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg",
  map: "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg",
} as const;

export function StaticMapPreview({
  center,
  zoom = 16,
  features,
  height = 250,
}: StaticMapPreviewProps) {
  const theme = useTheme();
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");

  const fillColor = hexToRgba(
    theme.map.defaultFillColor,
    theme.map.defaultFillAlpha,
  );

  return (
    <View pointerEvents="box-none" style={[styles.container, { height }]}>
      <Map style={styles.map} mapStyle={EMPTY_STYLE} dragPan={false}>
        <Camera
          initialViewState={{
            center,
            zoom,
          }}
        />

        <RasterSource
          id="swisstopo-satellite-preview"
          tiles={[TILE_URLS.satellite]}
          tileSize={256}
          maxzoom={20}
        >
          <Layer
            type="raster"
            id="satellite-preview-layer"
            layout={{
              visibility: baseLayer === "satellite" ? "visible" : "none",
            }}
          />
        </RasterSource>
        <RasterSource
          id="swisstopo-map-preview"
          tiles={[TILE_URLS.map]}
          tileSize={256}
          maxzoom={18}
        >
          <Layer
            type="raster"
            id="map-preview-layer"
            layout={{
              visibility: baseLayer === "map" ? "visible" : "none",
            }}
          />
        </RasterSource>

        <GeoJSONSource id="preview-features" data={features}>
          <Layer
            type="fill"
            id="preview-fill"
            paint={{
              "fill-color": fillColor,
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
      </Map>

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
