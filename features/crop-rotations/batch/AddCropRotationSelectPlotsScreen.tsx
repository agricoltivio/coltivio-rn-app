import * as turf from "@turf/turf";
import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Checkbox } from "@/components/inputs/Checkbox";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { useFarmQuery } from "@/features/farms/farms.hooks";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { AddCropRotationSelectPlotsScreenProps } from "../navigation/crop-rotations-routes";
import { hexToRgba } from "@/theme/theme";
import { Subtitle, Title } from "@/theme/Typography";
import { PortalHost } from "@gorhom/portal";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useCreateCropRotationStore } from "./crop-rotations.store";
import { useTranslation } from "react-i18next";
import { LabelMarker } from "@/features/map/LabelMarker";

export type SelectedFertilizerApplicationArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function AddCropRotationSelectPlotsScreen({
  navigation,
}: AddCropRotationSelectPlotsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);

  const { putPlot, removePlot, selectedPlotsById, resetSelectedPlots } =
    useCreateCropRotationStore();

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

  // Render all plots in a single pass — selected plots get a different fill color
  const plotPolygons = plots?.map((plot) => {
    const isSelected = plot.id in selectedPlotsById;
    if (isSelected) {
      return (
        <MultiPolygon
          key={plot.id}
          polygon={plot.geometry}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor={theme.colors.white}
          fillColor={hexToRgba(
            theme.colors.secondary,
            theme.map.defaultFillAlpha,
          )}
          tappable
          onPress={() => {
            handleSelectPlot(plot);
          }}
        />
      );
    }
    return (
      <MultiPolygon
        key={plot.id}
        polygon={plot.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor={theme.colors.white}
        fillColor={hexToRgba(
          theme.map.defaultFillColor,
          theme.map.defaultFillAlpha,
        )}
        tappable
        onPress={() => {
          handleSelectPlot(plot);
        }}
      />
    );
  });
  const markers = Object.values(selectedPlotsById).map((plot) => {
    const centroid = turf.centroid(plot.geometry);
    return (
      <LabelMarker
        key={`harvest-${plot.plotId}-marker`}
        latitude={centroid.geometry.coordinates[1]}
        longitude={centroid.geometry.coordinates[0]}
        text={plot.name}
      />
    );
  });

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
    if (plot.id in selectedPlotsById) {
      removePlot(plot.id);
    } else {
      putPlot({
        plotId: plot.id,
        name: plot.name,
        geometry: plot.geometry,
      });
    }
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => navigation.navigate("AddCropRotationSummary")}
            disabled={!Object.values(selectedPlotsById).length}
          />
        </BottomActionContainer>
      }
    >
      <MapView
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        loading={!mapVisible}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
      >
        {markers}
        {plotPolygons}
        <HomeMarker latitude={latitude} longitude={longitude} />
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowUserLocation} />
      <PlotSelectionTip />
      <PortalHost name="CropRotationMap" />
    </ContentView>
  );
}

export function PlotSelectionTip() {
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const { t } = useTranslation();
  const theme = useTheme();
  const [showTip, setShowTip] = useState(localSettings.showSelectPlotsTip);

  const [visible, setVisible] = useState(localSettings.showSelectPlotsTip);

  if (!visible) {
    return null;
  }

  function onDone() {
    if (!showTip) {
      updateLocalSettings("showSelectPlotsTip", false);
    }
    setVisible(false);
  }
  return (
    <Card
      style={{
        position: "absolute",
        top: 200,
        left: theme.spacing.m,
        right: theme.spacing.m,
        zIndex: 100,
      }}
    >
      {/* <Title>Wähle deine Schläge</Title> */}
      <View style={{ marginTop: theme.spacing.m }}>
        <Subtitle style={{ marginBottom: theme.spacing.s }}>
          {t("tips.select_plots.content")}
        </Subtitle>
      </View>
      <View style={{ marginTop: theme.spacing.l }}>
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.m,
            justifyContent: "center",
            marginBottom: theme.spacing.m,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              gap: theme.spacing.m,
              paddingVertical: theme.spacing.s,
            }}
            onPress={() => {
              setShowTip((prev) => !prev);
            }}
          >
            <Subtitle>{t("common.dont_show_again")}</Subtitle>
            <Checkbox
              checked={!showTip}
              onPress={() => {
                setShowTip((prev) => !prev);
              }}
            />
          </TouchableOpacity>
        </View>

        <Button fontSize={16} title="Ok" onPress={onDone} />
      </View>
    </Card>
  );
}
