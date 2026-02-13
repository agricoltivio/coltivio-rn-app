import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { LabelMarker } from "@/features/map/LabelMarker";
import { hexToRgba } from "@/theme/theme";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { MergePlotsMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";
import { PolygonDrawingTool } from "@/components/map/PolygonDrawingTool";

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
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([plotId]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMapVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [navigation]);

  if (!farm || !plots) {
    return null;
  }

  const plot = plots.find((plot) => plot.id === plotId);
  if (!plot) {
    return null;
  }

  const initialPlotCentroid = turf.centroid(plot.geometry);
  const [longitude, latitude] = initialPlotCentroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  };

  function togglePlot(id: string) {
    if (id === plotId) return;
    setSelectedPlotIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((prevId) => prevId !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  function handleNext() {
    navigation.navigate("MergePlotSummary", {
      plotIds: Array.from(selectedPlotIds),
    });
  }

  const plotsLayer = useMemo(() => {
    return plots
      .filter((plot) => plot.size > 0)
      .flatMap((plot) => {
        const isSelected = selectedPlotIds.includes(plot.id);
        const elements = [
          <MultiPolygon
            key={plot.id}
            polygon={plot.geometry}
            strokeWidth={theme.map.defaultStrokeWidth}
            strokeColor="white"
            fillColor={hexToRgba(
              isSelected ? theme.colors.secondary : theme.map.defaultFillColor,
              theme.map.defaultFillAlpha,
            )}
            tappable
            onPress={() => togglePlot(plot.id)}
          />,
        ];
        const centroid = turf.centroid(plot.geometry);
        elements.push(
          <LabelMarker
            key={`selected-area-${plot.id}-marker`}
            latitude={centroid.geometry.coordinates[1]}
            longitude={centroid.geometry.coordinates[0]}
            text={plot.name}
            hidden={!isSelected}
          />,
        );
        if (isSelected) {
        }
        return elements;
      });
  }, [plots, selectedPlotIds, theme]);

  return (
    <ContentView
      headerVisible={false}
      footerComponent={
        <BottomActionContainer floating>
          <Button
            title={t("buttons.next")}
            onPress={handleNext}
            disabled={selectedPlotIds.length < 2}
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
        {plotsLayer}
        <PolygonDrawingTool showActions={false} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <PortalHost name="MergePlotsMap" />
    </ContentView>
  );
}
