import {
  Camera,
  type CameraRef,
  Map,
  type MapRef,
  type LngLat,
  type StyleSpecification,
  RasterSource,
  Layer,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import React, { forwardRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "styled-components/native";

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
  children?: React.ReactNode;
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
            mapStyle={EMPTY_STYLE}
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

            {/* Both raster sources always mounted, visibility toggled */}
            <RasterSource
              id="swisstopo-satellite"
              tiles={[TILE_URLS.satellite]}
              tileSize={256}
              maxzoom={20}
            >
              <Layer
                type="raster"
                id="satellite-layer"
                layout={{
                  visibility: baseLayer === "satellite" ? "visible" : "none",
                }}
              />
            </RasterSource>
            <RasterSource
              id="swisstopo-map"
              tiles={[TILE_URLS.map]}
              tileSize={256}
              maxzoom={18}
            >
              <Layer
                type="raster"
                id="map-layer"
                layout={{
                  visibility: baseLayer === "map" ? "visible" : "none",
                }}
              />
            </RasterSource>

            {showUserLocation && <UserLocation />}

            {children}
          </Map>
        )}

        {(loading || !mapReady) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.secondary} />
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
