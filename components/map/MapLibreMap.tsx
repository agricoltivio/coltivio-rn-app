import {
  Camera,
  type CameraRef,
  Map,
  type MapRef,
  type LngLat,
  type StyleSpecification,
  Layer,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import React, { forwardRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "styled-components/native";
import { MapAttribution } from "./MapAttribution";
import { SWISSTOPO_TILE_BOUNDS } from "./swisstopo";

export type BaseLayer = "satellite" | "map";

type MapLibreMapProps = {
  initialCenter: LngLat;
  initialZoom?: number;
  loading?: boolean;
  showUserLocation?: boolean;
  baseLayer?: BaseLayer;
  dragPan?: boolean;
  onPress?: (event: { nativeEvent: { lngLat: LngLat } }) => void;
  cameraRef?: React.RefObject<CameraRef | null>;
  // Lifts the source note above panels that screens overlay on the bottom of the map.
  attributionBottomOffset?: number;
  children?: React.ReactNode;
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
    "swisstopo-satellite": {
      type: "raster",
      tiles: [TILE_URLS.satellite],
      tileSize: 256,
      maxzoom: 20,
      bounds: SWISSTOPO_TILE_BOUNDS,
    },
    "swisstopo-map": {
      type: "raster",
      tiles: [TILE_URLS.map],
      tileSize: 256,
      maxzoom: 18,
      bounds: SWISSTOPO_TILE_BOUNDS,
    },
  },
  layers: [],
};

export const MapLibreMap = forwardRef<MapRef, MapLibreMapProps>(
  function MapLibreMap(
    {
      initialCenter,
      initialZoom = 15,
      loading = false,
      showUserLocation = false,
      baseLayer = "satellite",
      dragPan = true,
      onPress,
      cameraRef,
      attributionBottomOffset,
      children,
    },
    ref,
  ) {
    const theme = useTheme();
    const [mapReady, setMapReady] = useState(false);

    return (
      <View style={styles.container}>
        {!loading && (
          <Map
            ref={ref}
            style={styles.map}
            mapStyle={BASE_STYLE}
            dragPan={dragPan}
            onPress={onPress}
            onDidFinishLoadingMap={() => setMapReady(true)}
            attribution={false}
            logo={false}
          >
            <Camera
              ref={cameraRef}
              initialViewState={{
                center: initialCenter,
                zoom: initialZoom,
              }}
            />

            {/* Both base map layers always mounted, visibility toggled */}
            <Layer
              type="raster"
              id="satellite-layer"
              source="swisstopo-satellite"
              layout={{
                visibility: baseLayer === "satellite" ? "visible" : "none",
              }}
            />
            <Layer
              type="raster"
              id="map-layer"
              source="swisstopo-map"
              layout={{
                visibility: baseLayer === "map" ? "visible" : "none",
              }}
            />

            {showUserLocation && <UserLocation />}

            {children}
          </Map>
        )}

        {!loading && (
          <MapAttribution alignRight bottomOffset={attributionBottomOffset} />
        )}

        {(loading || !mapReady) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.amber} />
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
