import { ContentView } from "@/components/containers/ContentView";
import { MapLibreMap, BaseLayer } from "@/components/map/MapLibreMap";
import { HomeMarkerLayer } from "@/components/map/HomeMarkerLayer";
import { DrawingOverlayRef, LAYER_IDS } from "@/components/map/DrawingOverlay";
import { IonIconButton } from "@/components/buttons/IconButton";
import { InsetsProps } from "@/constants/Screen";
import { MapLayerToggle } from "@/features/map/MapLayerToggle";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";

import { PortalHost } from "@gorhom/portal";
import {
  type MapRef,
  type CameraRef,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { useFarmQuery } from "../../farms/farms.hooks";
import { useLocalSettings } from "../../user/LocalSettingsContext";
import { useFarmPlotsQuery } from "../plots.hooks";
import { PlotsMapScreenProps } from "../navigation/plots-routes";
import {
  PlotsMapContext,
  createInitialMode,
  plotsMapReducer,
} from "./plots-map-mode";
import { MapLayers } from "./MapLayers";
import { MapOverlays } from "./MapOverlays";
import { PlotDetailsDrawer } from "./PlotDetailsDrawer";
import { PlotListModal } from "./PlotListModal";
import { DeletePlotDialog } from "./DeletePlotDialog";
import { SplitModeLayersHandle } from "./layers/SplitModeLayers";
import { AdjustModeLayersHandle } from "./layers/AdjustModeLayers";
import { CreateModeLayersHandle } from "./layers/CreateModeLayers";

const DRAG_Y_OFFSET = 40;

export function PlotsMapScreen({ route, navigation }: PlotsMapScreenProps) {
  const theme = useTheme();
  const { farm } = useFarmQuery();
  // isLoading = first-load only; isFetching would include background refetches which
  // temporarily unmount <Map> via the loading prop and reset the camera to initialViewState.
  const { plots, isLoading: plotsLoading } = useFarmPlotsQuery();
  const { localSettings } = useLocalSettings();
  const preselectedPlotId = route.params?.selectedPlotId;

  const insets = useSafeAreaInsets();
  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const [plotListVisible, setPlotListVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("satellite");
  const [dragPanEnabled, setDragPanEnabled] = useState(true);

  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const splitLayersRef = useRef<SplitModeLayersHandle>(null);
  const adjustLayersRef = useRef<AdjustModeLayersHandle>(null);
  const createLayersRef = useRef<CreateModeLayersHandle>(null);

  // Drawing overlay ref — used by split/adjust/create mode layers
  const drawingRef = useRef<DrawingOverlayRef>(null);
  const dragState = useRef<{ index: number } | null>(null);

  const [mode, dispatch] = useReducer(
    plotsMapReducer,
    createInitialMode(preselectedPlotId),
  );
  // Set when entering any non-view mode so flyTo is suppressed when returning to view.
  // Using an "entry" flag (set on mode enter, not exit) avoids any effect ordering dependency.
  const suppressFlyToRef = useRef(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMapVisible(true);
      if (!localSettings.plotsMapOnboardingCompleted) {
        navigation.navigate("PlotsMapOnboarding");
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [navigation, localSettings.plotsMapOnboardingCompleted]);

  // Mark that we've entered a non-view mode so the camera doesn't animate on exit
  useEffect(() => {
    if (mode.type !== "view") {
      suppressFlyToRef.current = true;
    }
  }, [mode.type]);

  // Auto-show the relevant onboarding the first time each tool is used
  useEffect(() => {
    switch (mode.type) {
      case "split":
        if (!localSettings.splitPlotOnboardingCompleted) {
          navigation.navigate("SplitPlotOnboarding");
        }
        break;
      case "merge":
        if (!localSettings.mergePlotsOnboardingCompleted) {
          navigation.navigate("MergePlotsOnboarding");
        }
        break;
      case "adjust":
        if (!localSettings.editPlotOnboardingCompleted) {
          navigation.navigate("AdjustPlotOnboarding");
        }
        break;
      case "create":
        if (!localSettings.addPlotDrawOnboardingCompleted) {
          navigation.navigate("MapDrawOnboarding", { variant: "create" });
        }
        break;
    }
  }, [
    mode.type,
    navigation,
    localSettings.splitPlotOnboardingCompleted,
    localSettings.mergePlotsOnboardingCompleted,
    localSettings.editPlotOnboardingCompleted,
    localSettings.addPlotDrawOnboardingCompleted,
  ]);

  // Extracted to avoid complex expression in the dependency array.
  // Encodes both mode type and selected plot: non-null only when in view mode with a selection.
  const flyToPlotId = mode.type === "view" ? mode.selectedPlotId : null;

  // Animate to selected plot when selection changes in view mode.
  // Skipped when returning from a non-view mode — camera is already positioned there.
  useEffect(() => {
    if (!flyToPlotId || !plots) return;
    if (suppressFlyToRef.current) {
      suppressFlyToRef.current = false;
      return;
    }
    const selectedPlot = plots.find((p) => p.id === flyToPlotId);
    if (!selectedPlot || selectedPlot.geometry.coordinates.length === 0) return;
    const centroid = turf.centroid(selectedPlot.geometry);
    const [longitude, latitude] = centroid.geometry.coordinates;
    cameraRef.current?.flyTo({ center: [longitude, latitude], duration: 500 });
  }, [flyToPlotId, plots]);

  // Extracted to avoid complex expression in the dependency array.
  // Non-null only when in view mode with a plot selected.
  const viewSelectedPlotId = mode.type === "view" ? mode.selectedPlotId : null;

  const handleMapPress = useCallback(
    (event: { nativeEvent: { lngLat: LngLat } }) => {
      if (mode.type === "view" && viewSelectedPlotId) {
        dispatch({ type: "SELECT_PLOT", plotId: null });
      } else if (mode.type === "split") {
        splitLayersRef.current?.handleMapPress(event.nativeEvent.lngLat);
      } else if (mode.type === "adjust") {
        adjustLayersRef.current?.handleMapPress(event.nativeEvent.lngLat);
      } else if (mode.type === "create") {
        createLayersRef.current?.handleMapPress(event.nativeEvent.lngLat);
      }
    },
    [mode.type, viewSelectedPlotId],
  );

  // React to selectedPlotId route param changes (e.g. after saving a new plot).
  // mode.type is intentionally excluded: adding it would cause re-dispatch on every mode change
  // while the param is still set in the route, which is not desired.
  useEffect(() => {
    const paramPlotId = route.params?.selectedPlotId;
    if (paramPlotId && mode.type !== "view") {
      dispatch({ type: "EXIT_MODE" });
    }
    if (paramPlotId) {
      dispatch({ type: "SELECT_PLOT", plotId: paramPlotId });
    }
  }, [route.params?.selectedPlotId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vertex drag gesture — hold 150ms on a vertex to start dragging
  const isDrawingMode =
    mode.type === "split" || mode.type === "adjust" || mode.type === "create";
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(isDrawingMode)
    .activateAfterLongPress(150)
    .onStart(async (event) => {
      const map = mapRef.current;
      if (!map) return;

      const isClosed = drawingRef.current?.isClosed() ?? false;
      // Polylines in split mode are never closed but should still allow dragging existing vertices
      const isSplitPolylineMode =
        mode.type === "split" && mode.activeToolMode === "polyline";
      if (!isClosed && !isSplitPolylineMode) return;

      const features = await map.queryRenderedFeatures([event.x, event.y], {
        layers: [LAYER_IDS.VERTICES, LAYER_IDS.MIDPOINTS],
      });

      if (features.length === 0) return;
      const feature = features[0];
      const props = feature.properties;
      if (!props) return;

      const offsetLngLat = await map.unproject([
        event.absoluteX,
        event.absoluteY - DRAG_Y_OFFSET,
      ]);

      if (props.type === "vertex" && typeof props.index === "number") {
        dragState.current = { index: props.index };
        drawingRef.current?.updateVertex(props.index, offsetLngLat);
        setDragPanEnabled(false);
      } else if (
        props.type === "midpoint" &&
        typeof props.afterIndex === "number"
      ) {
        const geometry = feature.geometry;
        if (geometry.type === "Point") {
          const lngLat: LngLat = [
            geometry.coordinates[0],
            geometry.coordinates[1],
          ];
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
      const lngLat = await map.unproject([
        event.absoluteX,
        event.absoluteY - DRAG_Y_OFFSET,
      ]);
      drawingRef.current?.updateVertex(dragState.current.index, lngLat);
    })
    .onEnd(async (event) => {
      if (!dragState.current) {
        const map = mapRef.current;
        if (map) {
          const lngLat = await map.unproject([
            event.absoluteX,
            event.absoluteY,
          ]);
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

  // Plots with size 0 have no geometry and can't be rendered on the map;
  // they are excluded from the context (map layers) but still shown in the list modal.
  const mapPlots = useMemo(
    () => (plots ?? []).filter((p) => p.size > 0),
    [plots],
  );

  const contextValue = useMemo(
    () => ({
      mode,
      dispatch,
      plots: mapPlots,
      mapRef,
      cameraRef,
      navigation,
      controlsExpanded,
      setControlsExpanded,
      drawingRef,
      baseLayer,
      setBaseLayer,
    }),
    [mode, dispatch, mapPlots, navigation, controlsExpanded, baseLayer],
  );

  if (!farm || !plots) return null;

  const initialCenter: LngLat = (() => {
    const preselectedPlot = plots.find((p) => p.id === preselectedPlotId);
    if (preselectedPlot && preselectedPlot.geometry.coordinates.length > 0) {
      const centroid = turf.centroid(preselectedPlot.geometry);
      return centroid.geometry.coordinates as LngLat;
    }
    return farm.location.coordinates as LngLat;
  })();

  const selectedPlot =
    mode.type === "view" && mode.selectedPlotId
      ? plots.find((p) => p.id === mode.selectedPlotId)
      : undefined;

  return (
    <PlotsMapContext.Provider value={contextValue}>
      <ContentView headerVisible={false}>
        <GestureDetector gesture={panGesture}>
          <View collapsable={false} style={StyleSheet.absoluteFill}>
            <MapLibreMap
              ref={mapRef}
              cameraRef={cameraRef}
              loading={!mapVisible || plotsLoading}
              initialCenter={initialCenter}
              initialZoom={17}
              baseLayer={baseLayer}
              dragPan={dragPanEnabled}
              showUserLocation={showsUserLocation}
              onPress={handleMapPress}
            >
              <MapLayers
                splitLayersRef={splitLayersRef}
                adjustLayersRef={adjustLayersRef}
                createLayersRef={createLayersRef}
              />
              <HomeMarkerLayer center={farm.location.coordinates as LngLat} />
            </MapLibreMap>
          </View>
        </GestureDetector>

        <MapLayerToggle baseLayer={baseLayer} onToggle={setBaseLayer} />
        <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
        <TopLeftBackButton />

        {/* Plot list button */}
        {mode.type === "view" && (
          <PlotListButton insets={insets}>
            <IonIconButton
              type="accent"
              color={theme.colors.black}
              iconSize={30}
              onPress={() => setPlotListVisible(true)}
              icon="list"
            />
          </PlotListButton>
        )}

        <PortalHost name="PlotsMapPortal" />

        {/* Mode-specific controls */}
        <MapOverlays
          splitLayersRef={splitLayersRef}
          adjustLayersRef={adjustLayersRef}
          onDelete={() => setDeleteDialogVisible(true)}
        />

        {/* Bottom drawer for view mode */}
        <PlotDetailsDrawer />

        {/* Plot list modal */}
        <PlotListModal
          visible={plotListVisible}
          onClose={() => setPlotListVisible(false)}
          plots={plots ?? []}
          onSelectPlot={(plot) =>
            dispatch({ type: "SELECT_PLOT", plotId: plot.id })
          }
          cameraRef={cameraRef}
        />

        {/* Delete confirmation dialog */}
        {selectedPlot && (
          <DeletePlotDialog
            visible={deleteDialogVisible}
            plotId={selectedPlot.id}
            plotName={selectedPlot.name}
            onClose={() => setDeleteDialogVisible(false)}
          />
        )}
      </ContentView>
    </PlotsMapContext.Provider>
  );
}

const PlotListButton = styled.View<InsetsProps>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.m}px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s + 100}px;
  align-items: center;
`;
