import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  DrawAction,
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { deviceHeight, deviceWidth } from "@/constants/Screen";
import { EditPlotMapScreenProps } from "./navigation/plots-routes";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  LatLng,
  MapPressEvent,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useTheme } from "styled-components/native";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useFarmPlotsQuery } from "./plots.hooks";

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

  // Show edit onboarding on first use
  useEffect(() => {
    if (!localSettings.editPlotOnboardingCompleted) {
      navigation.navigate("MapDrawOnboarding", { variant: "edit" });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true); // Render the map only after the transition ends
    });

    return unsubscribe;
  }, [navigation]);

  const plot = plots?.find((plot) => plot.id === plotId);

  if (!plot) {
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
      const area = turf.area(polygon);

      // navigate back and pass polygon and size
      navigation.popTo("EditPlot", {
        area: round(area, 0),
        polygon,
        plotId,
      });
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
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: deviceWidth,
        height: deviceHeight,
      }}
    >
      <MapView
        provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        showsCompass={false}
        loadingEnabled
        loading={!mapVisible}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        onPress={handleMapPress}
        mapType="satellite"
        initialRegion={initialRegion}
        followsUserLocation={true}
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
          onDrawActionChange={(action) => {
            setDrawingAction(action);
          }}
          magnifierMapContent={plotPolygons}
          onFinish={onFinishDrawing}
          onInfo={() => navigation.navigate("MapDrawOnboarding", { variant: "edit" })}
        />
      </MapView>
      <PortalHost name="PlotsMap" />
      <TopLeftBackButton />
    </View>
  );
}
