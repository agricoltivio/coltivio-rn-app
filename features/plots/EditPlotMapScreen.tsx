import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  DrawAction,
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { MapControls } from "@/features/map/overlays/MapControls";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import {
  LatLng,
  MapPressEvent,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { EditPlotMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery, useUpdatePlotMutation } from "./plots.hooks";

export function EditPlotMapScreen({
  navigation,
  route,
}: EditPlotMapScreenProps) {
  const theme = useTheme();
  const { plotId } = route.params;

  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(true);
  const [drawingAction, setDrawingAction] = useState<DrawAction>("edit");
  const [polygonIndex, setPolygonIndex] = useState(0);
  const [editedCoordinates, setEditedCoordinates] = useState<LatLng[][]>([]);

  const { localSettings } = useLocalSettings();
  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  const updatePlotMutation = useUpdatePlotMutation(
    () => navigation.navigate("PlotsMap", { selectedPlotId: plotId }),
    (error) => console.error(error),
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMapVisible(true);
      if (!localSettings.editPlotOnboardingCompleted) {
        navigation.navigate("EditPlotOnboarding");
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [navigation, localSettings.editPlotOnboardingCompleted]);

  const plot = plots?.find((plot) => plot.id === plotId);

  if (!plot) {
    return null;
  }

  const centroid = turf.centroid(plot.geometry);
  const [longitude, latitude] = centroid.geometry.coordinates;
  const initialRegion: Region = route.params?.initialRegion ?? {
    latitude,
    longitude,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (drawingAction === "draw") {
      event.stopPropagation();
      polygonDrawingToolRef.current?.drawToPoint(event.nativeEvent.coordinate);
    }
  };

  function onFinishDrawing(coordinates: LatLng[]) {
    if (polygonIndex < plot!.geometry.coordinates.length - 1) {
      polygonDrawingToolRef.current?.editPolygon(
        GeoSpatials.coordinatesToLatLng(
          plot!.geometry.coordinates[polygonIndex + 1][0],
        ),
      );
      setEditedCoordinates((prev) => [...prev, coordinates]);
      setPolygonIndex((prev) => prev + 1);
    } else {
      const finalCoordinates = [...editedCoordinates, coordinates];
      const polygon = GeoSpatials.latLngToMultiPolygon(finalCoordinates);
      const size = round(turf.area(polygon), 0);
      // Save directly and navigate back to PlotsMap
      updatePlotMutation.mutate({
        plotId,
        data: { geometry: polygon, size },
      });
    }
  }

  function handleConfirm() {
    const coordinates = polygonDrawingToolRef.current?.coordinates;
    if (coordinates) {
      onFinishDrawing(coordinates);
    }
  }

  const plotPolygons = plots?.map((plot) => (
    <MultiPolygon
      key={plot.id}
      polygon={plot.geometry}
      strokeWidth={theme.map.defaultStrokeWidth}
      strokeColor={"white"}
      fillColor={hexToRgba(
        theme.map.defaultFillColor,
        theme.map.defaultFillAlpha,
      )}
    />
  ));

  return (
    <ContentView headerVisible={false}>
      <MapView
        provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        showsCompass={false}
        loadingEnabled
        loading={!mapVisible}
        style={StyleSheet.absoluteFillObject}
        onPress={handleMapPress}
        mapType="satellite"
        initialRegion={initialRegion}
      >
        {plotPolygons}
        <PolygonDrawingTool
          initialAction="edit"
          initialPolygonCoordinates={plot.geometry.coordinates[0][0].map(
            ([longitude, latitude]) => ({
              longitude,
              latitude,
            }),
          )}
          portalName="PlotsMap"
          ref={polygonDrawingToolRef}
          showActions={false}
          onDrawActionChange={(action) => {
            setDrawingAction(action);
          }}
          magnifierMapContent={plotPolygons}
          onFinish={onFinishDrawing}
          onInfo={() =>
            navigation.navigate("EditPlotOnboarding")
          }
        />
      </MapView>
      <PortalHost name="PlotsMap" />
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="red"
          iconSize={30}
          icon="cancel"
          onPress={() => navigation.goBack()}
        />
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="green"
          iconSize={30}
          icon="check"
          disabled={updatePlotMutation.isPending}
          onPress={handleConfirm}
        />
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() => navigation.navigate("EditPlotOnboarding")}
        />
      </MapControls>
    </ContentView>
  );
}
