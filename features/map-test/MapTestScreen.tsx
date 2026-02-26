import { Plot } from "@/api/plots.api";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { indexToDistinctColor } from "@/theme/theme";
import { cutPolygonFromMultiPolygon, splitMultiPolygonByLine } from "@/utils/geo-spatials";
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  type MapRef,
  type LngLat,
  type StyleSpecification,
  RasterSource,
  UserLocation,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import {
  DrawingOverlay,
  type DrawingOverlayRef,
  LAYER_IDS,
} from "./DrawingOverlay";

// --- Types ---

type DrawMode = "none" | "draw-polygon" | "draw-polyline";

// --- Helpers ---

const DRAG_Y_OFFSET = 40;

function plotsToFeatureCollection(
  plots: Plot[],
  selectedPlotId: string | null,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: plots.map((plot, index) => ({
      type: "Feature",
      properties: {
        id: plot.id,
        name: plot.name,
        selected: plot.id === selectedPlotId ? 1 : 0,
        color: indexToDistinctColor(index),
      },
      geometry: plot.geometry,
    })),
  };
}

// --- Component ---

export function MapTestScreen() {
  const mapRef = useRef<MapRef>(null);
  const drawingRef = useRef<DrawingOverlayRef>(null);

  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();

  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [dragPanEnabled, setDragPanEnabled] = useState(true);

  const dragState = useRef<{ index: number } | null>(null);

  const farmCenter: LngLat = useMemo(() => {
    if (farm?.location?.coordinates) {
      return farm.location.coordinates as LngLat;
    }
    return [8.5, 47.0];
  }, [farm]);

  const plotsFeatureCollection = useMemo(
    () => plotsToFeatureCollection(plots ?? [], selectedPlotId),
    [plots, selectedPlotId],
  );

  const [splitResult, setSplitResult] = useState<GeoJSON.FeatureCollection | null>(null);

  // Label point at centroid of selected plot
  const selectedPlotLabel = useMemo((): GeoJSON.FeatureCollection => {
    if (!selectedPlotId || !plots) return { type: "FeatureCollection", features: [] };
    const plot = plots.find((p) => p.id === selectedPlotId);
    if (!plot) return { type: "FeatureCollection", features: [] };
    const centroid = turf.centroid(turf.multiPolygon(plot.geometry.coordinates));
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: plot.name },
          geometry: centroid.geometry,
        },
      ],
    };
  }, [selectedPlotId, plots]);

  // --- Handlers ---

  const handlePlotPress = useCallback(
    (event: { stopPropagation(): void; nativeEvent: { features: GeoJSON.Feature[] } }) => {
      // Don't select plots while drawing
      if (drawMode === "draw-polygon" || drawMode === "draw-polyline") return;

      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const plotId = feature?.properties?.id;
      if (typeof plotId === "string") {
        setSelectedPlotId((prev) => (prev === plotId ? null : plotId));
      }
    },
    [drawMode],
  );

  const handleMapPress = useCallback(
    (event: { nativeEvent: { lngLat: LngLat } }) => {
      if (drawMode === "draw-polygon" || drawMode === "draw-polyline") {
        drawingRef.current?.handleMapTap(event.nativeEvent.lngLat);
        return;
      }
      if (drawMode === "none") {
        setSelectedPlotId(null);
      }
    },
    [drawMode],
  );

  const handleCut = useCallback(() => {
    if (!selectedPlotId || !plots) return;
    const coords = drawingRef.current?.getCoordinates();
    if (!coords || coords.length < 2) {
      Alert.alert("Error", "Draw a polyline with at least 2 points first");
      return;
    }

    const selectedPlot = plots.find((p) => p.id === selectedPlotId);
    if (!selectedPlot) return;

    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: coords,
    };

    const result = splitMultiPolygonByLine(selectedPlot.geometry, line);
    if (!result || result.length < 2) {
      Alert.alert("Error", "Could not split the polygon. Make sure the line crosses it.");
      return;
    }

    const features: GeoJSON.Feature[] = result.map((multiPoly, i) => ({
      type: "Feature",
      properties: { color: indexToDistinctColor(i + 10) },
      geometry: multiPoly,
    }));
    setSplitResult({ type: "FeatureCollection", features });
    drawingRef.current?.reset();
    setDrawMode("none");
    Alert.alert("Success", `Polygon split into ${result.length} pieces`);
  }, [selectedPlotId, plots]);

  const handleCutout = useCallback(() => {
    if (!selectedPlotId || !plots) return;
    const coords = drawingRef.current?.getCoordinates();
    if (!coords || coords.length < 3) {
      Alert.alert("Error", "Draw a closed polygon first (at least 3 points)");
      return;
    }
    if (!drawingRef.current?.isClosed()) {
      Alert.alert("Error", "Close the polygon first by tapping the first vertex");
      return;
    }

    const selectedPlot = plots.find((p) => p.id === selectedPlotId);
    if (!selectedPlot) return;

    // Convert LngLat[] to { latitude, longitude }[] and close the ring
    const latLngCoords = coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));
    latLngCoords.push(latLngCoords[0]);

    const result = cutPolygonFromMultiPolygon(selectedPlot.geometry, latLngCoords);
    if (!result) {
      Alert.alert("Error", "Could not cut. Make sure the polygon overlaps the plot.");
      return;
    }

    const features: GeoJSON.Feature[] = [
      { type: "Feature", properties: { color: indexToDistinctColor(10) }, geometry: result.remaining },
      { type: "Feature", properties: { color: indexToDistinctColor(12) }, geometry: result.plots },
    ];
    setSplitResult({ type: "FeatureCollection", features });
    drawingRef.current?.reset();
    setDrawMode("none");
    Alert.alert("Success", "Polygon cutout applied");
  }, [selectedPlotId, plots]);

  const handleEdit = useCallback(() => {
    if (!selectedPlotId || !plots) return;
    const selectedPlot = plots.find((p) => p.id === selectedPlotId);
    if (!selectedPlot) return;

    // Load the first polygon's outer ring (drop the closing coordinate that duplicates the first)
    const outerRing = selectedPlot.geometry.coordinates[0]?.[0];
    if (!outerRing || outerRing.length < 4) return;
    const coords: LngLat[] = outerRing.slice(0, -1).map((c) => [c[0], c[1]] as LngLat);

    drawingRef.current?.loadCoordinates(coords);
    setSplitResult(null);
    setDrawMode("draw-polygon");
  }, [selectedPlotId, plots]);

  const toggleMode = useCallback(
    (newMode: DrawMode) => {
      if (drawMode === newMode) {
        setDrawMode("none");
      } else {
        drawingRef.current?.reset();
        setSplitResult(null);
        setDrawMode(newMode);
      }
    },
    [drawMode],
  );

  // --- Vertex drag gesture ---
  // Hold 150ms on a vertex to start dragging. Quick taps add points, quick drags pan.
  // If the gesture activates but no vertex is found, onEnd treats it as a tap (fallback).
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(drawMode !== "none")
    .activateAfterLongPress(150)
    .onStart(async (event) => {
      const map = mapRef.current;
      if (!map) return;

      // Don't drag vertices while drawing an unclosed polygon — taps should add points
      const isClosed = drawingRef.current?.isClosed() ?? false;
      if (drawMode === "draw-polygon" && !isClosed) return;

      const features = await map.queryRenderedFeatures(
        [event.x, event.y],
        { layers: [LAYER_IDS.VERTICES, LAYER_IDS.MIDPOINTS] },
      );

      if (features.length === 0) return;
      const feature = features[0];
      const props = feature.properties;
      if (!props) return;

      // Apply offset immediately so vertex jumps above the finger on pickup
      const offsetLngLat = await map.unproject([event.absoluteX, event.absoluteY - DRAG_Y_OFFSET]);

      if (props.type === "vertex" && typeof props.index === "number") {
        dragState.current = { index: props.index };
        drawingRef.current?.updateVertex(props.index, offsetLngLat);
        setDragPanEnabled(false);
      } else if (props.type === "midpoint" && typeof props.afterIndex === "number") {
        const geometry = feature.geometry;
        if (geometry.type === "Point") {
          const lngLat: LngLat = [geometry.coordinates[0], geometry.coordinates[1]];
          drawingRef.current?.insertVertex(props.afterIndex, lngLat);
          const newIndex = props.afterIndex + 1;
          dragState.current = { index: newIndex };
          drawingRef.current?.updateVertex(newIndex, offsetLngLat);
          setDragPanEnabled(false);
        }
      }
    })
    .onUpdate(async (event) => {
      if (!dragState.current) return;
      const map = mapRef.current;
      if (!map) return;

      const lngLat = await map.unproject([event.absoluteX, event.absoluteY - DRAG_Y_OFFSET]);
      drawingRef.current?.updateVertex(dragState.current.index, lngLat);
    })
    .onEnd(async (event) => {
      // Gesture activated but no vertex was dragged — treat as a tap (fallback for stolen taps)
      if (!dragState.current) {
        const map = mapRef.current;
        if (map) {
          const lngLat = await map.unproject([event.absoluteX, event.absoluteY]);
          drawingRef.current?.handleMapTap(lngLat);
        }
      }
      dragState.current = null;
      setDragPanEnabled(true);
    })
    .onFinalize(() => {
      dragState.current = null;
      setDragPanEnabled(true);
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <Map
          ref={mapRef}
          style={styles.map}
          mapStyle={EMPTY_STYLE}
          dragPan={dragPanEnabled}
          onPress={handleMapPress}
        >
          <Camera
            initialViewState={{
              center: farmCenter,
              zoom: 15,
            }}
          />

          <RasterTileSource />

          <GeoJSONSource
            id="plots"
            data={plotsFeatureCollection}
            onPress={handlePlotPress}
          >
            <Layer
              type="fill"
              id="plots-fill"
              paint={{
                "fill-color": [
                  "case",
                  ["==", ["get", "selected"], 1],
                  "#4CAF50",
                  ["get", "color"],
                ],
                "fill-opacity": 0.4,
              }}
            />
            <Layer
              type="line"
              id="plots-stroke"
              paint={{ "line-color": "white", "line-width": 2 }}
            />
          </GeoJSONSource>

          {/* Selected plot label */}
          <GeoJSONSource id="plot-label" data={selectedPlotLabel}>
            <Layer
              type="symbol"
              id="plot-label-text"
              layout={{
                "text-field": ["get", "name"],
                "text-size": 16,
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

          {splitResult ? (
            <GeoJSONSource id="split-result" data={splitResult}>
              <Layer
                type="fill"
                id="split-fill"
                paint={{
                  "fill-color": ["get", "color"],
                  "fill-opacity": 0.6,
                }}
              />
              <Layer
                type="line"
                id="split-stroke"
                paint={{ "line-color": "#FFFFFF", "line-width": 3 }}
              />
            </GeoJSONSource>
          ) : null}

          <DrawingOverlay
            ref={drawingRef}
            mode={drawMode}
            mapRef={mapRef}
          />

          <UserLocation />
        </Map>

        <View style={styles.toolbar}>
          {drawMode === "none" && selectedPlotId ? (
            <ToolbarButton label="Edit" active={false} onPress={handleEdit} />
          ) : null}
          <ToolbarButton
            label="Polygon"
            active={drawMode === "draw-polygon"}
            onPress={() => toggleMode("draw-polygon")}
          />
          <ToolbarButton
            label="Polyline"
            active={drawMode === "draw-polyline"}
            onPress={() => toggleMode("draw-polyline")}
          />
          {drawMode === "draw-polyline" && selectedPlotId ? (
            <ToolbarButton label="Cut" active={false} onPress={handleCut} />
          ) : null}
          {drawMode === "draw-polygon" && selectedPlotId ? (
            <ToolbarButton label="Cutout" active={false} onPress={handleCutout} />
          ) : null}
          <ToolbarButton
            label="Reset"
            active={false}
            onPress={() => {
              drawingRef.current?.reset();
              setSplitResult(null);
            }}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

// --- Sub-components ---

const EMPTY_STYLE: StyleSpecification = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {},
  layers: [],
};

function RasterTileSource() {
  return (
    <RasterSource
      id="swisstopo-satellite"
      tiles={[
        "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg",
      ]}
      tileSize={256}
      maxzoom={20}
    >
      <Layer type="raster" id="satellite-layer" />
    </RasterSource>
  );
}

function ToolbarButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.toolbarButton, active && styles.toolbarButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.toolbarButtonText,
          active && styles.toolbarButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  toolbar: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  toolbarButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  toolbarButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toolbarButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  toolbarButtonTextActive: {
    color: "#FFF",
  },
});
