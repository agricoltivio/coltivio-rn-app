import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { LabelMarker } from "@/features/map/LabelMarker";
import { hexToRgba } from "@/theme/theme";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { MergePlotsMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";

export function MergePlotsMapScreen({
  navigation,
  route,
}: MergePlotsMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<Set<string>>(
    new Set([plotId])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

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

  function togglePlot(id: string) {
    setSelectedPlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleNext() {
    navigation.navigate("MergePlotSummary", {
      plotIds: Array.from(selectedPlotIds),
    });
  }

  const mapLayer = plots.flatMap((plot) => {
    const isSelected = selectedPlotIds.has(plot.id);
    const elements = [
      <MultiPolygon
        key={plot.id}
        polygon={plot.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor="white"
        fillColor={hexToRgba(
          isSelected ? theme.colors.secondary : theme.map.defaultFillColor,
          theme.map.defaultFillAlpha
        )}
        tappable
        onPress={() => togglePlot(plot.id)}
      />,
    ];
    if (isSelected) {
      const centroid = turf.centroid(plot.geometry);
      elements.push(
        <LabelMarker
          key={`label-${plot.id}`}
          latitude={centroid.geometry.coordinates[1]}
          longitude={centroid.geometry.coordinates[0]}
          text={plot.name}
        /> as any
      );
    }
    return elements;
  });

  return (
    <ContentView
      headerVisible={false}
      footerComponent={
        <BottomActionContainer floating>
          <Button
            title={t("buttons.next")}
            onPress={handleNext}
            disabled={selectedPlotIds.size < 2}
          />
        </BottomActionContainer>
      }
    >
      <MapView
        loading={!mapVisible}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
      >
        {mapLayer}
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <PortalHost name="MergePlotsMap" />
    </ContentView>
  );
}
