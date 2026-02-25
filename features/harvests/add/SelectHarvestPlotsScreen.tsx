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
import { LabelMarker } from "@/features/map/LabelMarker";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { LatLng, MapPressEvent, Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../../farms/farms.hooks";
import { HomeMarker } from "../../map/layers/HomeMarker";
import { MapShowLocationToggle } from "../../map/MapShowLocationToggle";
import { useLocalSettings } from "../../user/LocalSettingsContext";
import { TopLeftBackButton } from "../../map/TopLeftBackButton";
import { useFarmPlotsQuery } from "../../plots/plots.hooks";
import { SelectHarvestPlotsScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestStore } from "./harvest.store";

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
    selectedPlotsById,
    resetSelectedPlots,
    totalProducedUnits,
  } = useCreateHarvestStore();

  const { localSettings } = useLocalSettings();
  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  // show map draw onboarding on first visit
  useEffect(() => {
    if (!localSettings.mapDrawOnboardingCompleted) {
      navigation.navigate("MapDrawOnboarding");
    }
  }, []);

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

  const mapLayer = plots?.flatMap((plot) => {
    const isSelected = plot.id in selectedPlotsById;
    const polygons = [
      <MultiPolygon
        key={plot.id}
        polygon={plot.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor={theme.colors.white}
        fillColor={hexToRgba(
          theme.map.defaultFillColor,
          theme.map.defaultFillAlpha,
        )}
        tappable={!isSelected && drawingAction === "select"}
        onPress={(e) => {
          if (!isSelected) {
            handleSelectPlot(plot);
          }
        }}
      />,
    ];
    if (isSelected) {
      const centroid = turf.centroid(plot.geometry);
      polygons.push(
        <MultiPolygon
          key={`selected-area-${plot.id}`}
          polygon={selectedPlotsById[plot.id].geometry}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor={"white"}
          fillColor={hexToRgba(
            theme.colors.secondary,
            theme.map.defaultFillAlpha,
          )}
          tappable={drawingAction === "select"}
          onPress={(e) => {
            handleSelectPlot(plot);
          }}
        />,
        <LabelMarker
          key={`selected-area-${plot.id}-marker`}
          latitude={centroid.geometry.coordinates[1]}
          longitude={centroid.geometry.coordinates[0]}
          text={plot.name}
        />,
      );
    }
    return polygons;
  });

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
      removeHarvestPlot(plot.id);
    } else {
      putHarvestPlot({
        plotId: plot.id,
        name: plot.name,
        geometry: plot.geometry,
        harvestSize: round(plot.size, 0),
        amountInKilos: 0,
        numberOfUnits: 0,
      });
    }
  }

  function onHarvestAreaDrawComplete(coordinates: LatLng[]) {
    if (!plots) {
      return;
    }
    const plotIntersections = GeoSpatials.plotIntersections(
      plots,
      GeoSpatials.latLngToMultiPolygon([coordinates]),
    );
    for (const plotIntersection of plotIntersections) {
      putHarvestPlot({
        name: plotIntersection.plot.name,
        plotId: plotIntersection.plot.id,
        geometry: plotIntersection.intersection.geometry,
        harvestSize: round(plotIntersection.intersection.size, 0),
        amountInKilos: 0,
        numberOfUnits: 0,
      });
    }
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => {
              const selectedPlots = Object.values(selectedPlotsById);
              // Skip divide screen if only 1 plot is selected - assign all to that plot
              if (selectedPlots.length === 1) {
                const plot = selectedPlots[0];
                putHarvestPlot({
                  ...plot,
                  numberOfUnits: totalProducedUnits ?? 0,
                });
                navigation.navigate("HarvestSummary");
              } else {
                navigation.navigate("DivideHarvestOnPlots");
              }
            }}
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
        {mapLayer}
        <PolygonDrawingTool
          portalName="HarvestMap"
          ref={polygonDrawingToolRef}
          onDrawActionChange={(action) => {
            setDrawingAction(action);
          }}
          magnifierMapContent={mapLayer}
          onFinish={onHarvestAreaDrawComplete}
          onInfo={() => navigation.navigate("MapDrawOnboarding")}
        />
        <HomeMarker latitude={latitude} longitude={longitude} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PortalHost name="HarvestMap" />
    </ContentView>
  );
}
