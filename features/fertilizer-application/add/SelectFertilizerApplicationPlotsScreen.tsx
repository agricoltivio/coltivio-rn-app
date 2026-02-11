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
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { SelectFertilizerApplicationPlotsScreenProps } from "../navigation/fertilizer-application-routes";
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
import { LabelMarker } from "@/features/map/LabelMarker";

export type SelectedFertilizerApplicationArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function SelectFertilizerApplicationPlotsScreen({
  navigation,
}: SelectFertilizerApplicationPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [drawingAction, setDrawingAction] = useState<DrawAction>("select");

  const {
    putPlot,
    removePlot,
    selectedPlotsById,
    resetSelectedPlots,
    totalNumberOfApplications,
    setTotalNumberOfApplications,
    fertilizerApplication,
  } = useCreateFertilizerApplicationStore();

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
      removePlot(plot.id);
    } else {
      putPlot({
        plotId: plot.id,
        name: plot.name,
        geometry: plot.geometry,
        size: round(plot.size, 0),
        numberOfUnits: 0,
      });
    }
  }

  function onFertilizerApplicationAreaDrawComplete(coordinates: LatLng[]) {
    if (!plots) {
      return;
    }
    const plotIntersections = GeoSpatials.plotIntersections(
      plots,
      GeoSpatials.latLngToMultiPolygon([coordinates]),
    );
    for (const plotIntersection of plotIntersections) {
      putPlot({
        name: plotIntersection.plot.name,
        plotId: plotIntersection.plot.id,
        geometry: plotIntersection.intersection.geometry,
        size: round(plotIntersection.intersection.size, 0),
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
              const unit = fertilizerApplication?.unit;

              // For amount_per_hectare: auto-calculate hectares from plot sizes
              if (unit === "amount_per_hectare") {
                const totalHectares = selectedPlots.reduce((acc, p) => acc + p.size, 0) / 10000;
                setTotalNumberOfApplications(totalHectares);
                // Pre-fill each plot's numberOfUnits with its individual hectares
                for (const plot of selectedPlots) {
                  putPlot({ ...plot, numberOfUnits: plot.size / 10000 });
                }
                // Always go to divide screen so user can review/adjust
                navigation.navigate("DivideFertilizerApplicationOnPlots");
                return;
              }

              // Skip divide screen if only 1 plot is selected - assign all to that plot
              if (selectedPlots.length === 1) {
                const plot = selectedPlots[0];
                putPlot({
                  ...plot,
                  numberOfUnits: totalNumberOfApplications ?? 0,
                });
                navigation.navigate("FertilizerApplicationSummary");
              } else {
                navigation.navigate("DivideFertilizerApplicationOnPlots");
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
          portalName="FertilizerApplicationMap"
          ref={polygonDrawingToolRef}
          onDrawActionChange={(action) => {
            setDrawingAction(action);
          }}
          onFinish={onFertilizerApplicationAreaDrawComplete}
          onInfo={() => navigation.navigate("MapDrawOnboarding")}
        />
        <HomeMarker latitude={latitude} longitude={longitude} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PortalHost name="FertilizerApplicationMap" />
    </ContentView>
  );
}
