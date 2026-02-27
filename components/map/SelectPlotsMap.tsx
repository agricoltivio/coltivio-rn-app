import { Plot } from "@/api/plots.api";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { HomeMarkerLayer } from "@/components/map/HomeMarkerLayer";
import { MapLibreMap, type BaseLayer } from "@/components/map/MapLibreMap";
import { PlotsLayer } from "@/components/map/PlotsLayer";
import {
  DrawingOverlay,
  DrawingOverlayRef,
  LAYER_IDS,
} from "@/components/map/DrawingOverlay";
import { LabelLayer } from "@/components/map/LabelLayer";
import { MapLayerToggle } from "@/features/map/MapLayerToggle";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { GeoSpatials, type LngLat } from "@/utils/geo-spatials";
import { hexToRgba } from "@/theme/theme";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import { type MapRef } from "@maplibre/maplibre-react-native";
import {
  GeoJSONSource,
  Layer,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useTheme } from "styled-components/native";

type SelectedPlotArea = {
  plotId?: string;
  id?: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size?: number;
};

type SelectPlotsMapProps = {
  selectedPlotsById: Record<string, SelectedPlotArea>;
  onTogglePlot: (plot: Plot) => void;
  onDrawComplete?: (intersections: Array<{ plot: Plot; geometry: GeoJSON.MultiPolygon; size: number }>) => void;
  enableDrawing?: boolean;
  portalName?: string;
  onNavigateToOnboarding?: () => void;
  children?: React.ReactNode;
};

const DRAG_Y_OFFSET = 40;

export function SelectPlotsMap({
  selectedPlotsById,
  onTogglePlot,
  onDrawComplete,
  enableDrawing = false,
  portalName = "SelectPlotsMap",
  onNavigateToOnboarding,
  children,
}: SelectPlotsMapProps) {
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragPanEnabled, setDragPanEnabled] = useState(true);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");

  const mapRef = useRef<MapRef>(null);
  const drawingRef = useRef<DrawingOverlayRef>(null);
  const dragState = useRef<{ index: number } | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMapVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Selected areas overlay — show intersection geometries for drawn selections
  const selectedAreasData = useMemo((): GeoJSON.FeatureCollection => {
    const entries = Object.entries(selectedPlotsById);
    return {
      type: "FeatureCollection",
      features: entries.map(([key, area]) => ({
        type: "Feature",
        properties: { id: key },
        geometry: area.geometry,
      })),
    };
  }, [selectedPlotsById]);

  // Labels for selected plots
  const selectedLabels = useMemo(() => {
    return Object.values(selectedPlotsById).map((area) => {
      const centroid = turf.centroid(area.geometry);
      return {
        center: centroid.geometry.coordinates as [number, number],
        text: area.name,
      };
    });
  }, [selectedPlotsById]);

  const handlePlotPress = useCallback(
    (event: { stopPropagation(): void; nativeEvent: { features: GeoJSON.Feature[] } }) => {
      if (isDrawing) return;
      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const plotId = feature?.properties?.id;
      if (typeof plotId === "string" && plots) {
        const plot = plots.find((p) => p.id === plotId);
        if (plot) onTogglePlot(plot);
      }
    },
    [isDrawing, plots, onTogglePlot],
  );

  const handleMapPress = useCallback(
    (event: { nativeEvent: { lngLat: LngLat } }) => {
      if (isDrawing && enableDrawing) {
        drawingRef.current?.handleMapTap(event.nativeEvent.lngLat);
      }
    },
    [isDrawing, enableDrawing],
  );

  const handleDrawingComplete = useCallback(
    (coordinates: LngLat[], closed: boolean) => {
      if (!closed || coordinates.length < 3 || !plots || !onDrawComplete) return;
      const polygon = GeoSpatials.lngLatToMultiPolygon([coordinates]);
      const intersections = GeoSpatials.plotIntersections(plots, polygon);
      onDrawComplete(
        intersections.map((pi) => ({
          plot: pi.plot,
          geometry: pi.intersection.geometry,
          size: round(pi.intersection.size, 0),
        })),
      );
      drawingRef.current?.reset();
      setIsDrawing(false);
    },
    [plots, onDrawComplete],
  );

  // Vertex drag gesture for drawing
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(isDrawing && enableDrawing)
    .activateAfterLongPress(150)
    .onStart(async (event) => {
      const map = mapRef.current;
      if (!map) return;
      const isClosed = drawingRef.current?.isClosed() ?? false;
      if (!isClosed) return;

      const features = await map.queryRenderedFeatures(
        [event.x, event.y],
        { layers: [LAYER_IDS.VERTICES, LAYER_IDS.MIDPOINTS] },
      );
      if (features.length === 0) return;
      const feature = features[0];
      const props = feature.properties;
      if (!props) return;

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

  if (!farm || !plots) return null;

  const farmCenter: LngLat = farm.location.coordinates as LngLat;
  const selectedPlotIds = Object.keys(selectedPlotsById);

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <View collapsable={false} style={{ flex: 1 }}>
        <MapLibreMap
          ref={mapRef}
          loading={!mapVisible}
          initialCenter={farmCenter}
          initialZoom={16}
          baseLayer={baseLayer}
          dragPan={dragPanEnabled}
          showUserLocation={showUserLocation}
          onPress={handleMapPress}
        >
          {/* All plots */}
          <PlotsLayer
            plots={plots}
            selectedPlotIds={selectedPlotIds}
            selectedColor={theme.colors.secondary}
            onPlotPress={handlePlotPress}
          />

          {/* Selected area overlays (drawn intersections) */}
          <GeoJSONSource id="selected-areas" data={selectedAreasData}>
            <Layer
              type="fill"
              id="selected-areas-fill"
              paint={{
                "fill-color": hexToRgba(theme.colors.secondary, theme.map.defaultFillAlpha),
                "fill-opacity": 1,
              }}
            />
            <Layer
              type="line"
              id="selected-areas-stroke"
              paint={{ "line-color": "white", "line-width": theme.map.defaultStrokeWidth }}
            />
          </GeoJSONSource>

          {/* Labels */}
          <LabelLayer labels={selectedLabels} />

          {/* Drawing overlay */}
          {enableDrawing && isDrawing && (
            <DrawingOverlay
              ref={drawingRef}
              mode="draw-polygon"
              mapRef={mapRef}
              onCoordinatesChange={handleDrawingComplete}
            />
          )}

          <HomeMarkerLayer center={farmCenter} />
        </MapLibreMap>
        </View>
      </GestureDetector>

      <TopLeftBackButton />
      <MapLayerToggle baseLayer={baseLayer} onToggle={setBaseLayer} />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PortalHost name={portalName} />

      {children}
    </View>
  );
}
