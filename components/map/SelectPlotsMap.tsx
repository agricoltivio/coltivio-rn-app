import { Plot } from "@/api/plots.api";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { HomeMarkerLayer } from "@/components/map/HomeMarkerLayer";
import { MapLibreMap, type BaseLayer } from "@/components/map/MapLibreMap";
import { PlotsLayer, type PlotColorMode } from "@/components/map/PlotsLayer";
import { PlotListModal } from "@/features/plots/map/PlotListModal";
import {
  DrawingOverlay,
  DrawingOverlayRef,
} from "@/components/map/DrawingOverlay";
import { useVertexDrag } from "@/components/map/useVertexDrag";
import { LabelLayer } from "@/components/map/LabelLayer";
import { MapLayerToggle } from "@/features/map/MapLayerToggle";
import { MapPlotColorToggle } from "@/features/map/MapPlotColorToggle";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import {
  IonIconButton,
  MaterialCommunityIconButton,
} from "@/components/buttons/IconButton";
import { GeoSpatials, type LngLat } from "@/utils/geo-spatials";
import { hexToRgba } from "@/theme/theme";
import { round } from "@/utils/math";
import { Portal, PortalHost } from "@gorhom/portal";
import { type CameraRef, type MapRef } from "@maplibre/maplibre-react-native";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import { MapControls } from "@/features/map/overlays/MapControls";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import type { ViewInstance } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  onDrawComplete?: (
    intersections: {
      plot: Plot;
      geometry: GeoJSON.MultiPolygon;
      size: number;
    }[],
  ) => void;
  enableDrawing?: boolean;
  portalName?: string;
  onNavigateToOnboarding?: () => void;
  children?: React.ReactNode;
  /** When provided, only these plot IDs are shown on the map */
  allowedPlotIds?: string[];
};

// Drawing phases: idle → draw (adding vertices) → edit (polygon closed, adjust vertices) → idle
type DrawPhase = "idle" | "draw" | "edit";

export function SelectPlotsMap({
  selectedPlotsById,
  onTogglePlot,
  onDrawComplete,
  enableDrawing = false,
  portalName = "SelectPlotsMap",
  onNavigateToOnboarding,
  children,
  allowedPlotIds,
}: SelectPlotsMapProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { farm } = useFarmQuery();
  const { plots: allPlots } = useFarmPlotsQuery();
  const { localSettings } = useLocalSettings();
  // Exclude plots with no geometry (size 0) — they can't be rendered or meaningfully selected.
  // When allowedPlotIds is set, further restrict to only those plots.
  const plots = useMemo(() => {
    if (!allPlots) return null;
    const withGeometry = allPlots.filter((p) => p.size > 0);
    if (!allowedPlotIds) return withGeometry;
    const allowed = new Set(allowedPlotIds);
    return withGeometry.filter((p) => allowed.has(p.id));
  }, [allPlots, allowedPlotIds]);
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [drawPhase, setDrawPhase] = useState<DrawPhase>("idle");
  const [baseLayer, setBaseLayer] = useState<BaseLayer>(
    localSettings.defaultMapLayer,
  );
  const [plotColorMode, setPlotColorMode] = useState<PlotColorMode>(
    localSettings.defaultPlotColorMode,
  );
  const [plotListVisible, setPlotListVisible] = useState(false);

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const drawingRef = useRef<DrawingOverlayRef>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMapVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Classify each selected entry as a full-plot selection (tap) or a partial
  // draw intersection, by comparing its area against the matching plot's
  // full area. Full selections are already highlighted (fill/stroke + label)
  // by PlotsLayer's selected styling, keyed off fullySelectedPlotIds below —
  // only partial intersections need their own overlay/label, since their
  // geometry (and centroid) differs from the full plot.
  const { fullySelectedPlotIds, partialSelections } = useMemo(() => {
    const fullyIds: string[] = [];
    const partial: [string, SelectedPlotArea][] = [];
    for (const [key, area] of Object.entries(selectedPlotsById)) {
      const plot = plots?.find((p) => p.id === (area.plotId ?? area.id));
      if (plot) {
        const selectedArea = turf.area(area.geometry);
        const fullPlotArea = turf.area(
          turf.multiPolygon(plot.geometry.coordinates),
        );
        if (Math.abs(1 - selectedArea / fullPlotArea) < 0.001) {
          fullyIds.push(key);
          continue;
        }
      }
      partial.push([key, area]);
    }
    return { fullySelectedPlotIds: fullyIds, partialSelections: partial };
  }, [selectedPlotsById, plots]);

  // Selected areas overlay — only partial draw intersections, styled to match
  // PlotsLayer's selected plot styling (success fill + warning stroke).
  const selectedAreasData = useMemo((): GeoJSON.FeatureCollection => {
    return {
      type: "FeatureCollection",
      features: partialSelections.map(([key, area]) => ({
        type: "Feature",
        properties: { id: key },
        geometry: area.geometry,
      })),
    };
  }, [partialSelections]);

  // Labels for partial draw intersections only — their centroid can differ
  // from the full plot's, so they need a label independent of PlotsLayer's.
  const selectedLabels = useMemo(() => {
    return partialSelections.map(([, area]) => {
      const centroid = turf.centroid(area.geometry);
      return {
        center: centroid.geometry.coordinates as [number, number],
        text: area.name,
      };
    });
  }, [partialSelections]);

  const handlePlotPress = useCallback(
    (event: {
      stopPropagation(): void;
      nativeEvent: { features: GeoJSON.Feature[]; lngLat: [number, number] };
    }) => {
      if (drawPhase !== "idle") return;
      event.stopPropagation();
      const { features, lngLat } = event.nativeEvent;
      // When nested plots overlap, pick the one whose boundary is nearest to the tap point
      let feature: GeoJSON.Feature | undefined;
      if (features.length <= 1) {
        feature = features[0];
      } else {
        const tapPoint = turf.point(lngLat);
        const distances = features.map((f) => {
          if (f.geometry.type !== "Polygon") return Infinity;
          const exteriorRing = turf.lineString(f.geometry.coordinates[0]);
          return (
            turf.nearestPointOnLine(exteriorRing, tapPoint).properties.dist ??
            Infinity
          );
        });
        feature = features[distances.indexOf(Math.min(...distances))];
      }
      const plotId = feature?.properties?.id;
      if (typeof plotId === "string" && plots) {
        const plot = plots.find((p) => p.id === plotId);
        if (plot) onTogglePlot(plot);
      }
    },
    [drawPhase, plots, onTogglePlot],
  );

  const handleMapPress = useCallback(
    (event: { nativeEvent: { lngLat: LngLat } }) => {
      // Only forward taps to drawing overlay during the draw phase (not edit — polygon is closed)
      if (drawPhase === "draw" && enableDrawing) {
        drawingRef.current?.handleMapTap(event.nativeEvent.lngLat);
      }
    },
    [drawPhase, enableDrawing],
  );

  // Called by DrawingOverlay on every coordinate change (including vertex drags)
  const handleDrawingChange = useCallback(
    (coordinates: LngLat[], closed: boolean) => {
      setDrawPhase((prev) => {
        if (closed && coordinates.length >= 3) return "edit";
        // Undo may reopen the polygon — go back to draw phase
        if (!closed && prev === "edit") return "draw";
        return prev;
      });
    },
    [],
  );

  // Confirm the drawn polygon — compute intersections and call onDrawComplete
  function handleConfirm() {
    const coords = drawingRef.current?.getCoordinates();
    if (!coords || coords.length < 3 || !plots || !onDrawComplete) return;
    const polygon = GeoSpatials.lngLatToMultiPolygon([coords]);
    const intersections = GeoSpatials.plotIntersections(plots, polygon);
    onDrawComplete(
      intersections.map((pi) => ({
        plot: pi.plot,
        geometry: pi.intersection.geometry,
        size: round(pi.intersection.size, 0),
      })),
    );
    drawingRef.current?.reset();
    setDrawPhase("idle");
  }

  // Vertex drag: hold a vertex or midpoint, then drag it
  const mapViewRef = useRef<ViewInstance>(null);
  const { dragPan, touchHandlers } = useVertexDrag({
    enabled: drawPhase !== "idle" && enableDrawing,
    canDrag: () => drawingRef.current?.isClosed() ?? false,
    mapRef,
    mapViewRef,
    drawingRef,
  });

  if (!farm || !plots) return null;

  const farmCenter: LngLat = farm.location.coordinates as LngLat;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View
        ref={mapViewRef}
        collapsable={false}
        style={{ flex: 1 }}
        {...touchHandlers}
      >
        <MapLibreMap
          ref={mapRef}
          cameraRef={cameraRef}
          loading={!mapVisible}
          initialCenter={farmCenter}
          initialZoom={16}
          baseLayer={baseLayer}
          dragPan={dragPan}
          showUserLocation={showUserLocation}
          onPress={handleMapPress}
        >
          {/* All plots — selectedPlotIds drives selection coloring (success fill + yellow stroke).
                Only fully-selected (tapped) plots are passed here; partial draw
                intersections are highlighted via the selected-areas overlay below instead,
                so a drawn sub-area doesn't paint the whole underlying plot as selected. */}
          <PlotsLayer
            plots={plots}
            selectedPlotIds={fullySelectedPlotIds}
            onPlotPress={handlePlotPress}
            showZoomLabels
            plotColorMode={plotColorMode}
          />

          {/* Selected area overlays — only for partial draw intersections, styled to match
                PlotsLayer's selected plot styling (success fill + yellow stroke) */}
          {enableDrawing && (
            <GeoJSONSource id="selected-areas" data={selectedAreasData}>
              <Layer
                type="fill"
                id="selected-areas-fill"
                paint={{
                  "fill-color": hexToRgba(
                    theme.colors.success,
                    theme.map.defaultFillAlpha,
                  ),
                  "fill-opacity": 1,
                }}
              />
              <Layer
                type="line"
                id="selected-areas-stroke"
                paint={{
                  "line-color": theme.colors.warning,
                  "line-width": 3,
                }}
              />
            </GeoJSONSource>
          )}

          {/* Labels */}
          <LabelLayer labels={selectedLabels} />

          {/* Drawing overlay — active during draw and edit phases */}
          {enableDrawing && drawPhase !== "idle" && (
            <DrawingOverlay
              ref={drawingRef}
              mode={drawPhase === "edit" ? "edit" : "draw-polygon"}
              mapRef={mapRef}
              onCoordinatesChange={handleDrawingChange}
            />
          )}

          <HomeMarkerLayer center={farmCenter} />
        </MapLibreMap>
      </View>

      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <TopLeftBackButton />

      {/* Plot list button */}
      <View
        style={{
          position: "absolute",
          left: theme.spacing.m,
          top: insets.top + theme.spacing.s + 100,
        }}
      >
        <IonIconButton
          type="accent"
          color={theme.colors.black}
          iconSize={30}
          onPress={() => setPlotListVisible(true)}
          icon="list"
        />
      </View>

      <MapLayerToggle
        baseLayer={baseLayer}
        onToggle={setBaseLayer}
        topOffset={insets.top + theme.spacing.s + 150}
      />
      <MapPlotColorToggle
        plotColorMode={plotColorMode}
        onChange={setPlotColorMode}
        topOffset={insets.top + theme.spacing.s + 200}
      />

      <PortalHost name={portalName} />

      {/* Drawing controls via Portal */}
      {enableDrawing && (
        <Portal hostName={portalName}>
          <MapControls>
            {/* Idle: show polygon tool button */}
            {drawPhase === "idle" && (
              <MaterialCommunityIconButton
                style={{ backgroundColor: theme.colors.surface }}
                type="accent"
                color="black"
                iconSize={30}
                icon="vector-polygon"
                onPress={() => setDrawPhase("draw")}
              />
            )}
            {/* Draw/edit phases: undo, confirm (enabled only in edit), cancel */}
            {drawPhase !== "idle" && (
              <>
                <MaterialCommunityIconButton
                  type="accent"
                  color="black"
                  iconSize={30}
                  icon="close-circle-outline"
                  onPress={() => {
                    drawingRef.current?.reset();
                    setDrawPhase("idle");
                  }}
                />
                <MaterialCommunityIconButton
                  type="accent"
                  color="black"
                  iconSize={30}
                  icon="undo"
                  onPress={() => drawingRef.current?.undo()}
                />
                <MaterialCommunityIconButton
                  type="accent"
                  color={drawPhase === "edit" ? "green" : "gray"}
                  iconSize={30}
                  icon="check-circle-outline"
                  disabled={drawPhase !== "edit"}
                  onPress={handleConfirm}
                />
              </>
            )}
            {onNavigateToOnboarding && (
              <MaterialCommunityIconButton
                style={{ backgroundColor: theme.colors.surface }}
                type="accent"
                color="black"
                iconSize={30}
                icon="information-outline"
                onPress={onNavigateToOnboarding}
              />
            )}
          </MapControls>
        </Portal>
      )}

      <PlotListModal
        visible={plotListVisible}
        onClose={() => setPlotListVisible(false)}
        plots={plots ?? []}
        onSelectPlot={onTogglePlot}
        cameraRef={cameraRef}
      />

      {children}
    </View>
  );
}
