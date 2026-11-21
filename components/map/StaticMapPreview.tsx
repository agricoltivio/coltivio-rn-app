import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  RasterSource,
  type InitialViewState,
  type LngLat,
  type LngLatBounds,
  type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { hexToRgba } from "@/theme/theme";
import * as turf from "@turf/turf";
import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "styled-components/native";
import { MapAttribution } from "./MapAttribution";

type BaseLayer = "satellite" | "map";

type StaticMapPreviewProps = {
  /** Without a center, the camera fits the bounds of all features. */
  center?: LngLat;
  zoom?: number;
  features: GeoJSON.FeatureCollection;
  height?: number;
  /** Makes the whole preview a button: no map gestures, a tap anywhere calls this. */
  onPress?: () => void;
  /** Screen reader label for the tappable preview */
  accessibilityLabel?: string;
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

const FIT_PADDING = 24;
// Points the finger may move before a tap on a tappable preview stops counting
const TAP_MAX_DISTANCE = 10;
const FIT_MAX_ZOOM = 19;

export function StaticMapPreview({
  center,
  zoom = 16,
  features,
  height = 250,
  onPress,
  accessibilityLabel,
}: StaticMapPreviewProps) {
  // A tappable preview is fully static: zooming or rotating it by accident while
  // scrolling the screen would be confusing
  const gesturesEnabled = onPress === undefined;

  // A tap, not a press: it fails as soon as the finger moves more than a few points in
  // any direction, so a scroll or a sideways swipe starting on the map doesn't open it
  const onPressRef = useRef(onPress);
  onPressRef.current = onPress;
  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(TAP_MAX_DISTANCE)
        .runOnJS(true)
        .onEnd((_event, success) => {
          if (success) onPressRef.current?.();
        }),
    [],
  );
  const theme = useTheme();
  const [baseLayer] = useState<BaseLayer>("satellite");

  const fillColor = hexToRgba(
    theme.map.defaultFillColor,
    theme.map.defaultFillAlpha,
  );

  const initialViewState = useMemo((): InitialViewState => {
    if (center || features.features.length === 0) {
      return { center, zoom };
    }
    return {
      bounds: turf.bbox(features) as LngLatBounds,
      padding: {
        top: FIT_PADDING,
        right: FIT_PADDING,
        bottom: FIT_PADDING,
        left: FIT_PADDING,
      },
    };
  }, [center, zoom, features]);

  return (
    <View pointerEvents="box-none" style={[styles.container, { height }]}>
      <Map
        style={styles.map}
        mapStyle={EMPTY_STYLE}
        dragPan={false}
        touchZoom={gesturesEnabled}
        touchRotate={gesturesEnabled}
        touchPitch={gesturesEnabled}
        doubleTapZoom={gesturesEnabled}
        doubleTapHoldZoom={gesturesEnabled}
        attribution={false}
        logo={false}
      >
        <Camera
          initialViewState={initialViewState}
          maxZoom={center ? undefined : FIT_MAX_ZOOM}
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
      </Map>

      {/* Covers the map, so the map never gets the touch; only a tap opens */}
      {onPress && (
        <GestureDetector gesture={tapGesture}>
          <View
            style={StyleSheet.absoluteFill}
            accessible
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            // Screen readers activate it without a touch gesture
            onAccessibilityTap={onPress}
          />
        </GestureDetector>
      )}

      {/* After the overlay, so its link stays tappable */}
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
