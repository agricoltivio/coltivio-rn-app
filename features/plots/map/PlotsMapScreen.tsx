import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { IonIconButton } from "@/components/buttons/IconButton";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { InsetsProps } from "@/constants/Screen";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { StyleSheet } from "react-native";
import RnMapView, { MapPressEvent, Region } from "react-native-maps";
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
export function PlotsMapScreen({ route, navigation }: PlotsMapScreenProps) {
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots, isFetching: plotsLoading } = useFarmPlotsQuery();
  const { localSettings } = useLocalSettings();
  const preselectedPlotId = route.params?.selectedPlotId;

  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const [plotListVisible, setPlotListVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(false);

  const mapRef = useRef<RnMapView>(null);
  const splitLayersRef = useRef<SplitModeLayersHandle>(null);
  const adjustLayersRef = useRef<AdjustModeLayersHandle>(null);
  const createLayersRef = useRef<CreateModeLayersHandle>(null);
  const regionRef = useRef({
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  });

  const [mode, dispatch] = useReducer(
    plotsMapReducer,
    createInitialMode(preselectedPlotId),
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMapVisible(true);
      if (!localSettings.plotsMapOnboardingCompleted) {
        navigation.navigate("MapDrawOnboarding", { variant: "plotsMap" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [navigation, localSettings.plotsMapOnboardingCompleted]);

  // Animate to selected plot when selection changes in view mode
  useEffect(() => {
    if (mode.type !== "view" || !mode.selectedPlotId || !plots) return;
    const selectedPlot = plots.find((p) => p.id === mode.selectedPlotId);
    if (!selectedPlot) return;
    const centroid = turf.centroid(selectedPlot.geometry);
    const [longitude, latitude] = centroid.geometry.coordinates;
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: regionRef.current.latitudeDelta,
      longitudeDelta: regionRef.current.longitudeDelta,
    });
  }, [mode.type === "view" ? mode.selectedPlotId : null]);

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (mode.type === "split") {
        splitLayersRef.current?.handleMapPress(event);
      } else if (mode.type === "adjust") {
        adjustLayersRef.current?.handleMapPress(event);
      } else if (mode.type === "create") {
        createLayersRef.current?.handleMapPress(event);
      }
    },
    [mode.type],
  );

  if (!farm || !plots) return null;

  const initialRegion: Region = (() => {
    const preselectedPlot = plots.find((p) => p.id === preselectedPlotId);
    if (preselectedPlot && preselectedPlot.geometry.coordinates.length > 0) {
      const centroid = turf.centroid(preselectedPlot.geometry);
      const [longitude, latitude] = centroid.geometry.coordinates;
      return {
        latitude,
        longitude,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      };
    }
    return {
      latitude: farm.location.coordinates[1],
      longitude: farm.location.coordinates[0],
      latitudeDelta: 0.0025,
      longitudeDelta: 0.0025,
    };
  })();

  const selectedPlot =
    mode.type === "view" && mode.selectedPlotId
      ? plots.find((p) => p.id === mode.selectedPlotId)
      : undefined;

  const contextValue = useMemo(
    () => ({
      mode,
      dispatch,
      plots,
      mapRef,
      navigation,
      controlsExpanded,
      setControlsExpanded,
    }),
    [mode, dispatch, plots, navigation, controlsExpanded],
  );

  return (
    <PlotsMapContext.Provider value={contextValue}>
      <ContentView headerVisible={false}>
        <MapView
          key={`map-${mode.type}`}
          ref={mapRef}
          loading={!mapVisible || plotsLoading}
          style={StyleSheet.absoluteFillObject}
          onRegionChangeComplete={(region) => {
            regionRef.current = region;
          }}
          onPress={handleMapPress}
          initialRegion={initialRegion}
          showsUserLocation={showsUserLocation}
        >
          <MapLayers
            splitLayersRef={splitLayersRef}
            adjustLayersRef={adjustLayersRef}
            createLayersRef={createLayersRef}
          />
          <HomeMarker
            latitude={farm.location.coordinates[1]}
            longitude={farm.location.coordinates[0]}
          />
        </MapView>

        <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
        <TopLeftBackButton />

        {/* Plot list button - positioned below the location toggle */}
        {mode.type === "view" && (
          <PlotListButton insets={useSafeAreaInsets()}>
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
          onSelectPlot={(plot) => dispatch({ type: "SELECT_PLOT", plotId: plot.id })}
          mapRef={mapRef}
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
