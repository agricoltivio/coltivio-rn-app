import { Plot } from "@/api/plots.api";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import { FAB } from "@/components/buttons/FAB";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { PlotsMapScreenProps } from "@/navigation/rootStackTypes";
import { hexToRgba } from "@/theme/theme";
import { H3, Subtitle } from "@/theme/Typography";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { useFarmPlotsQuery } from "./plots.hooks";
import { useTranslation } from "react-i18next";

export function PlotsMapScreen({ navigation }: PlotsMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState<boolean>(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });

    return unsubscribe;
  }, [navigation]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  navigation.addListener("focus", () => {
    if (selectedPlotId) {
      handleExpandBottomDrawer();
    }
  });

  function onPlotSelect(plot: Plot) {
    if (selectedPlotId === plot.id) {
      handleDismissBottomDrawer();
      setSelectedPlotId(null);
    } else {
      setSelectedPlotId(plot.id);
      handleExpandBottomDrawer();
    }
  }

  if (!farm || !plots) {
    return null;
  }

  const [longitude, latitude] = farm.location.coordinates;

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  };

  const selectedPlot = plots?.find((plot) => plot.id === selectedPlotId);

  const plotPolygons = plots.map((plot) => (
    <MultiPolygon
      key={plot.id}
      polygon={plot.geometry}
      strokeWidth={theme.map.defaultStrokeWidth}
      strokeColor={"white"}
      fillColor={hexToRgba(
        plot.id === selectedPlot?.id
          ? theme.colors.success
          : theme.map.defaultFillColor,
        theme.map.defaultFillAlpha
      )}
      tappable
      onPress={(event) => onPlotSelect(plot)}
    />
  ));

  return (
    <ContentView headerVisible={false}>
      <MapView
        loading={!mapVisible}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
      >
        {plotPolygons}
        {initialRegion && (
          <HomeMarker
            latitude={initialRegion.latitude}
            longitude={initialRegion.longitude}
          />
        )}
      </MapView>
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <TopLeftBackButton />
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("AddPlotMap")}
        color="blue"
      />
      <BottomSheetModalProvider>
        <BottomDrawerModal
          onClose={() => setSelectedPlotId(null)}
          ref={bottomSheetModalRef}
          backdropDisappearsOnIndex={0}
        >
          <View style={{ flexDirection: "row" }}>
            <View
              style={{
                flexGrow: 1,
              }}
            >
              <H3>{t("plots.plot_name", { name: selectedPlot?.name })}</H3>
              <Subtitle style={{ marginTop: theme.spacing.s }}>
                {t("plots.map.selected_plot.size", {
                  size: Number(selectedPlot?.size) / 100,
                })}
              </Subtitle>
              {selectedPlot?.cropRotations[0] ? (
                <Subtitle>
                  {t("plots.map.selected_plot.crop", {
                    crop: selectedPlot?.cropRotations[0].crop.name,
                  })}
                </Subtitle>
              ) : null}
            </View>
            <View>
              <Button
                title="Details"
                fontSize={16}
                type="accent"
                onPress={() => {
                  navigation.navigate("PlotDetails", {
                    plotId: selectedPlot!.id,
                  });
                }}
              />
            </View>
          </View>
        </BottomDrawerModal>
      </BottomSheetModalProvider>
    </ContentView>
  );
}
