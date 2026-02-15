import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { LabelMarker } from "@/features/map/LabelMarker";
import { hexToRgba } from "@/theme/theme";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { MergePlotsMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";
import { PolygonDrawingTool } from "@/components/map/PolygonDrawingTool";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "../map/overlays/MapControls";

export function MergePlotsMapScreen({
  navigation,
  route,
}: MergePlotsMapScreenProps) {
  const theme = useTheme();
  const { plotId } = route.params;
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const { localSettings } = useLocalSettings();
  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([plotId]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMapVisible(true);
      if (!localSettings.mergePlotsOnboardingCompleted) {
        navigation.navigate("MergePlotsOnboarding" as never);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [navigation, localSettings.mergePlotsOnboardingCompleted]);

  if (!farm || !plots) {
    return null;
  }

  const plot = plots.find((plot) => plot.id === plotId);
  if (!plot) {
    return null;
  }

  const initialPlotCentroid = turf.centroid(plot.geometry);
  const [longitude, latitude] = initialPlotCentroid.geometry.coordinates;
  const initialRegion: Region = route.params?.initialRegion ?? {
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
      primaryPlotId: plotId,
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
    <ContentView headerVisible={false}>
      <MapView
        loading={!mapVisible}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
      >
        {plotsLayer}
        <PolygonDrawingTool showActions={false} />
      </MapView>
      <PortalHost name="MergePlotsMap" />
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
          disabled={selectedPlotIds.length < 2}
          onPress={handleNext}
        />
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() =>
            navigation.navigate("MergePlotsOnboarding" as never)
          }
        />
      </MapControls>
    </ContentView>
  );
}
