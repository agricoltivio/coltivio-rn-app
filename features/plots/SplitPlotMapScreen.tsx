import { Button } from "@/components/buttons/Button";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import {
  PolylineDrawingTool,
  PolylineDrawingToolActions,
} from "@/components/map/PolylineDrawingTool";
import { MapControls } from "@/features/map/overlays/MapControls";
import { hexToRgba, indexToDistinctColor } from "@/theme/theme";
import {
  cutPolygonFromMultiPolygon,
  splitMultiPolygonByLine,
} from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { Portal, PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet } from "react-native";
import { LatLng, MapPressEvent, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { SplitPlotMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";
import { SubPlotData, useSplitPlotStore } from "./split-plot.store";

type ActiveToolMode = "polyline" | "polygon" | "none";

export function SplitPlotMapScreen({
  navigation,
  route,
}: SplitPlotMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { plots } = useFarmPlotsQuery();
  const splitPlotStore = useSplitPlotStore();

  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const [activeToolMode, setActiveToolMode] = useState<ActiveToolMode>("none");
  // Iterative cut state: starts with [plot.geometry], grows after each cut
  const [currentPolygons, setCurrentPolygons] = useState<
    GeoJSON.MultiPolygon[]
  >([]);

  const polylineRef = useRef<PolylineDrawingToolActions>(null);
  const polygonRef = useRef<PolygonDrawingToolActions>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    return () => splitPlotStore.reset();
  }, []);

  const plot = plots?.find((p) => p.id === plotId);

  // Initialize currentPolygons with the plot geometry once available
  useEffect(() => {
    if (plot && currentPolygons.length === 0) {
      setCurrentPolygons([plot.geometry]);
    }
  }, [plot]);

  if (!plot || !plots) {
    return null;
  }

  const centroid = turf.centroid(plot.geometry);
  const [longitude, latitude] = centroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (activeToolMode === "polyline") {
      event.stopPropagation();
      polylineRef.current?.drawToPoint(event.nativeEvent.coordinate);
    } else if (activeToolMode === "polygon") {
      event.stopPropagation();
      polygonRef.current?.drawToPoint(event.nativeEvent.coordinate);
    }
  };

  function handlePolylineCut() {
    const coords = polylineRef.current?.getCoordinates();
    if (!coords || coords.length < 2) {
      Alert.alert(t("plots.split.split_failed"));
      return;
    }
    const newPolygons: GeoJSON.MultiPolygon[] = [];
    for (const polygon of currentPolygons) {
      const result = splitMultiPolygonByLine(polygon, {
        type: "LineString",
        coordinates: coords.map(({ longitude, latitude }) => [
          longitude,
          latitude,
        ]),
      });
      if (result) {
        newPolygons.push(...result);
      } else {
        newPolygons.push(polygon);
      }
    }
    setCurrentPolygons(newPolygons);

    polylineRef.current?.reset();
    setActiveToolMode("none");
  }

  function handlePolygonCut(drawnCoordinates: LatLng[]) {
    if (!drawnCoordinates?.length || drawnCoordinates.length < 4) {
      Alert.alert(t("plots.split.split_failed"));
      return;
    }

    const newPolygons: GeoJSON.MultiPolygon[] = [];
    for (const currentPolygon of currentPolygons) {
      const result = cutPolygonFromMultiPolygon(
        currentPolygon,
        drawnCoordinates,
      );
      if (result) {
        newPolygons.push(result.remaining, result.plots);
      } else {
        newPolygons.push(currentPolygon);
      }
    }
    setCurrentPolygons(newPolygons);

    setActiveToolMode("none");
  }

  function handleDone() {
    if (currentPolygons.length < 2) return;
    const subPlots: SubPlotData[] = currentPolygons.map((geom) => ({
      geometry: geom,
      size: round(turf.area(geom), 0),
    }));
    splitPlotStore.setData(subPlots, plot!.name);
    navigation.navigate("SplitPlotSummary", { plotId });
  }

  const hasMultiplePolygons = currentPolygons.length >= 2;

  return (
    <ContentView
      headerVisible={false}
      footerComponent={
        hasMultiplePolygons ? (
          <BottomActionContainer floating>
            <Button title={t("buttons.finish")} onPress={handleDone} />
          </BottomActionContainer>
        ) : undefined
      }
    >
      <MapView
        loading={!mapVisible}
        style={StyleSheet.absoluteFillObject}
        onPress={handleMapPress}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
      >
        {/* Show current polygon pieces */}
        {currentPolygons.map((geom, i) => (
          <MultiPolygon
            key={`poly-${i}`}
            polygon={geom}
            strokeWidth={theme.map.defaultStrokeWidth}
            strokeColor="white"
            fillColor={hexToRgba(
              hasMultiplePolygons
                ? indexToDistinctColor(i)
                : theme.map.defaultFillColor,
              hasMultiplePolygons ? 0.6 : theme.map.defaultFillAlpha,
            )}
          />
        ))}
        {/* Polyline drawing tool */}
        {activeToolMode === "polyline" && (
          <PolylineDrawingTool ref={polylineRef} />
        )}
        {/* Polygon drawing tool */}
        {activeToolMode === "polygon" && (
          <PolygonDrawingTool
            ref={polygonRef}
            initialAction="draw"
            portalName="SplitPlotMap"
            onFinish={handlePolygonCut}
            finishIcon="content-cut"
            onDrawActionChange={(action) => {
              if (action !== "draw") {
                setActiveToolMode("none");
              }
            }}
          />
        )}
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <PortalHost name="SplitPlotMap" />
      {/* Custom toolbar */}
      <Portal hostName="SplitPlotMap">
        {activeToolMode !== "polygon" && (
          <MapControls>
            {/* Polyline mode toggle */}
            <MaterialCommunityIconButton
              style={{
                backgroundColor:
                  activeToolMode === "polyline"
                    ? theme.colors.primary
                    : theme.colors.accent,
              }}
              type="accent"
              color={activeToolMode === "polyline" ? "white" : "black"}
              iconSize={30}
              icon="vector-polyline-plus"
              onPress={() =>
                setActiveToolMode((prev) =>
                  prev === "polyline" ? "none" : "polyline",
                )
              }
            />
            {/* Polygon mode toggle */}
            {activeToolMode === "none" && (
              <MaterialCommunityIconButton
                style={{
                  backgroundColor: theme.colors.accent,
                }}
                type="accent"
                color={"black"}
                iconSize={30}
                icon="vector-polygon"
                onPress={() =>
                  setActiveToolMode((prev) =>
                    prev === "polygon" ? "none" : "polygon",
                  )
                }
              />
            )}
            {/* Undo */}
            {/* <MaterialCommunityIconButton
              type="accent"
              color="black"
              iconSize={30}
              icon="undo-variant"
              disabled={activeToolMode === "none"}
              onPress={handleUndo}
            /> */}
            {/* Cut / Scissor */}
            {activeToolMode === "polyline" && (
              <MaterialCommunityIconButton
                type="accent"
                color="green"
                iconSize={30}
                icon="content-cut"
                disabled={activeToolMode !== "polyline"}
                onPress={handlePolylineCut}
              />
            )}
          </MapControls>
        )}
      </Portal>
    </ContentView>
  );
}
