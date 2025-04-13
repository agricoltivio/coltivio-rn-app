import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  DrawAction,
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { PlotSelectionOrDrawTip } from "@/features/map/tips/PlotSelectionOrDrawTip";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { AddFertilizerApplicationSelectPlotsScreenProps } from "@/navigation/rootStackTypes";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { LatLng, MapPressEvent, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { useTranslation } from "react-i18next";

export type SelectedFertilizerApplicationArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function AddFertilizerApplicationSelectPlotsScreen({
  navigation,
}: AddFertilizerApplicationSelectPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [drawingAction, setDrawingAction] = useState<DrawAction>("select");

  const { putPlot, removePlot, selectedPlotsById, resetSelectedPlots } =
    useCreateFertilizerApplicationStore();

  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  // in case the total quantity is changed we reset the selected areas when navigating back
  useEffect(() => {
    return resetSelectedPlots;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true); // Render the map only after the transition ends
    });

    return unsubscribe;
  }, [navigation]);

  const plotPolygons = plots?.map((plot) => (
    <MultiPolygon
      key={plot.id}
      polygon={plot.geometry}
      strokeWidth={theme.map.defaultStrokeWidth}
      strokeColor={theme.colors.white}
      fillColor={hexToRgba(
        theme.map.defaultFillColor,
        theme.map.defaultFillAlpha
      )}
      tappable={drawingAction === "select"}
      onPress={(e) => {
        handleSelectPlot(plot);
      }}
    />
  ));

  const fertilizerApplicationPolygons = Object.values(selectedPlotsById).map(
    (plot) => (
      <MultiPolygon
        key={`fertilizerApplication-${plot.plotId}`}
        polygon={plot.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor={"white"}
        fillColor={hexToRgba(
          theme.colors.secondary,
          theme.map.defaultFillAlpha
        )}
      />
    )
  );

  const handleMapPress = (event: MapPressEvent) => {
    if (drawingAction === "draw") {
      event.stopPropagation();
      polygonDrawingToolRef.current?.drawToPoint(event.nativeEvent.coordinate);
    }
  };

  if (!farm || !plots) {
    return null;
  }

  const [longitude, latitude] = farm.location.coordinates;

  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  };

  function handleSelectPlot(plot: Plot) {
    if (drawingAction === "draw") {
      return;
    }
    if (plot.id in selectedPlotsById) {
      removePlot(plot.id);
    } else {
      putPlot({
        plotId: plot.id,
        name: plot.name,
        geometry: plot.geometry,
        size: round(plot.size, 0),
        numberOfApplications: 0,
      });
    }
  }

  function onFertilizerApplicationAreaDrawComplete(coordinates: LatLng[]) {
    if (!plots) {
      return;
    }
    const plotIntersections = GeoSpatials.plotIntersections(
      plots,
      GeoSpatials.latLngToMultiPolygon([coordinates])
    );
    for (const plotIntersection of plotIntersections) {
      putPlot({
        name: plotIntersection.plot.name,
        plotId: plotIntersection.plot.id,
        geometry: plotIntersection.intersection.geometry,
        size: round(plotIntersection.intersection.size, 0),
        numberOfApplications: 0,
      });
    }
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() =>
              navigation.navigate("AddFertilizerApplicationDivideOnPlots")
            }
            disabled={!Object.values(selectedPlotsById).length}
          />
        </BottomActionContainer>
      }
    >
      <MapView
        onPress={handleMapPress}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        loading={!mapVisible}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
      >
        {plotPolygons}
        {fertilizerApplicationPolygons}
        <PolygonDrawingTool
          portalName="FertilizerApplicationMap"
          ref={polygonDrawingToolRef}
          onDrawActionChange={(action) => {
            setDrawingAction(action);
          }}
          onFinish={onFertilizerApplicationAreaDrawComplete}
        />
        <HomeMarker latitude={latitude} longitude={longitude} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PlotSelectionOrDrawTip />
      <PortalHost name="FertilizerApplicationMap" />
    </ContentView>
  );
}
