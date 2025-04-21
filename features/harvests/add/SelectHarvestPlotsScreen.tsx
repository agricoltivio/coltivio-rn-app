import * as turf from "@turf/turf";
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
import { SelectHarvestPlotsScreenProps } from "../navigation/harvest-routes";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { LatLng, MapPressEvent, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../../farms/farms.hooks";
import { HomeMarker } from "../../map/layers/HomeMarker";
import { MapShowLocationToggle } from "../../map/MapShowLocationToggle";
import { PlotSelectionOrDrawTip } from "../../map/tips/PlotSelectionOrDrawTip";
import { TopLeftBackButton } from "../../map/TopLeftBackButton";
import { useFarmPlotsQuery } from "../../plots/plots.hooks";
import { useCreateHarvestStore } from "./harvest.store";
import { useTranslation } from "react-i18next";
import { LabelMarker } from "@/features/map/LabelMarker";

export type SelectedHarvestArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function SelectHarvestPlotsScreen({
  navigation,
}: SelectHarvestPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [drawingAction, setDrawingAction] = useState<DrawAction>("select");

  const {
    harvest,
    putHarvestPlot,
    removeHarvestPlot,
    selectedHarvestPlotsById,
    resetSelectedHarvestPlots,
  } = useCreateHarvestStore();

  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  // in case the total quantity is changed we reset the selected areas when navigating back
  useEffect(() => {
    return resetSelectedHarvestPlots;
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true); // Render the map only after the transition ends
    });

    return unsubscribe;
  }, [navigation]);

  const availablePlots = plots?.filter(
    (plot) => plot.cropRotations[0]?.cropId === harvest?.cropId
  );

  const plotPolygons = availablePlots?.map((plot) => (
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

  const harvestPolygons = Object.values(selectedHarvestPlotsById).flatMap(
    (harvestPlot) => {
      const centroid = turf.centroid(harvestPlot.harvestArea);
      return [
        <MultiPolygon
          key={`harvest-${harvestPlot.plotId}`}
          polygon={harvestPlot.harvestArea}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor={"white"}
          fillColor={hexToRgba(
            theme.colors.secondary,
            theme.map.defaultFillAlpha
          )}
        />,
        <LabelMarker
          key={`harvest-${harvestPlot.plotId}-marker`}
          latitude={centroid.geometry.coordinates[1]}
          longitude={centroid.geometry.coordinates[0]}
          text={harvestPlot.name}
        />,
      ];
    }
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
    if (plot.id in selectedHarvestPlotsById) {
      removeHarvestPlot(plot.id);
    } else {
      putHarvestPlot({
        plotId: plot.id,
        name: plot.name,
        harvestArea: plot.geometry,
        harvestSize: round(plot.size, 0),
        amountInKilos: 0,
        producedUnits: 0,
      });
    }
  }

  function onHarvestAreaDrawComplete(coordinates: LatLng[]) {
    if (!availablePlots) {
      return;
    }
    const plotIntersections = GeoSpatials.plotIntersections(
      availablePlots,
      GeoSpatials.latLngToMultiPolygon([coordinates])
    );
    for (const plotIntersection of plotIntersections) {
      putHarvestPlot({
        name: plotIntersection.plot.name,
        plotId: plotIntersection.plot.id,
        harvestArea: plotIntersection.intersection.geometry,
        harvestSize: round(plotIntersection.intersection.size, 0),
        amountInKilos: 0,
        producedUnits: 0,
      });
    }
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => navigation.navigate("DivideHarvestOnPlots")}
            disabled={!Object.values(selectedHarvestPlotsById).length}
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
        {harvestPolygons}
        <PolygonDrawingTool
          portalName="HarvestMap"
          ref={polygonDrawingToolRef}
          onDrawActionChange={(action) => {
            setDrawingAction(action);
          }}
          magnifierMapContent={plotPolygons}
          onFinish={onHarvestAreaDrawComplete}
        />
        <HomeMarker latitude={latitude} longitude={longitude} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PlotSelectionOrDrawTip />
      <PortalHost name="HarvestMap" />
    </ContentView>
  );
}
