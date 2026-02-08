import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { hexToRgba } from "@/theme/theme";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { LabelMarker } from "@/features/map/LabelMarker";
import { SelectPlotsForPlanScreenProps } from "../navigation/crop-rotations-routes.d";
import { Plot } from "@/api/plots.api";
import { useTranslation } from "react-i18next";

export function SelectPlotsForPlanScreen({ navigation }: SelectPlotsForPlanScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

  const togglePlot = (plot: Plot) => {
    setSelectedPlotIds(prev => {
      const next = new Set(prev);
      if (next.has(plot.id)) {
        next.delete(plot.id);
      } else {
        next.add(plot.id);
      }
      return next;
    });
  };

  const mapLayer = useMemo(() => {
    if (!plots) return null;

    return plots.flatMap(plot => {
      const isSelected = selectedPlotIds.has(plot.id);
      const layers = [
        <MultiPolygon
          key={plot.id}
          polygon={plot.geometry}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor={theme.colors.white}
          fillColor={hexToRgba(
            isSelected ? theme.colors.secondary : theme.map.defaultFillColor,
            theme.map.defaultFillAlpha
          )}
          tappable
          onPress={() => togglePlot(plot)}
        />,
      ];

      if (isSelected) {
        const centroid = turf.centroid(plot.geometry);
        layers.push(
          <LabelMarker
            key={`label-${plot.id}`}
            latitude={centroid.geometry.coordinates[1]}
            longitude={centroid.geometry.coordinates[0]}
            text={plot.name}
          />
        );
      }

      return layers;
    });
  }, [plots, selectedPlotIds, theme]);

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

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => {
              navigation.navigate("PlanCropRotations", {
                plotIds: Array.from(selectedPlotIds),
              });
            }}
            disabled={selectedPlotIds.size === 0}
          />
        </BottomActionContainer>
      }
    >
      <MapView
        style={StyleSheet.absoluteFillObject}
        loading={!mapVisible}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
      >
        {mapLayer}
        <HomeMarker latitude={latitude} longitude={longitude} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PortalHost name="SelectPlotsMap" />
    </ContentView>
  );
}
