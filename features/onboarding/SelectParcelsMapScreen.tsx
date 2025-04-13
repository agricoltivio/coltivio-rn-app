import { FederalFarmPlot } from "@/api/layers.api";
import { Button } from "@/components/buttons/Button";
import { MapView } from "@/components/map/Map";
import { hexToRgba } from "@/theme/theme";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Geojson, Region } from "react-native-maps";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useFarmAndNearbyPlotsQuery } from "../federal-plots/federalPlots.hooks";
import { HomeMarker } from "../map/layers/HomeMarker";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { useOnboarding } from "./OnboardingContext";
import { Card } from "@/components/card/Card";
import { Subtitle, Title } from "@/theme/Typography";
import { NavigationButton } from "./NavigationButton";
import { Stepper } from "./Stepper";
import { SelectParcelsMapScreenProps } from "@/navigation/rootStackTypes";

export function SelectParcelsMapScreen({
  navigation,
  route,
}: SelectParcelsMapScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [mapVisible, setMapVisible] = useState(false);
  const { data, setData } = useOnboarding();
  const { plots: parcels, isFetching } = useFarmAndNearbyPlotsQuery(
    data.federalFarmId!,
    0.5
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true); // Render the map only after the transition ends
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const farmParcelsById: Record<string, FederalFarmPlot> = {};
    if (parcels) {
      for (const parcel of parcels) {
        if (parcel.federalFarmId === data.federalFarmId) {
          farmParcelsById[parcel.id] = parcel;
        }
      }
      setData((prev) => ({
        ...prev,
        parcelsById: farmParcelsById,
      }));
    }
    return () => {
      setData((prev) => ({
        ...prev,
        parcelsById: {},
      }));
    };
  }, [parcels]);

  const { lng, lat } = data.location!;

  const initialRegion: Region = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  };

  function onParcelToggle(selectedParcel: FederalFarmPlot) {
    setData(({ parcelsById, ...rest }) => {
      const currentParcels = { ...parcelsById };
      if (selectedParcel.id in currentParcels) {
        delete currentParcels[selectedParcel.id];
      } else {
        currentParcels[selectedParcel.id] = selectedParcel;
      }
      return { ...rest, parcelsById: currentParcels };
    });
  }

  return (
    <>
      <MapView
        loading={!mapVisible}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        mapType="satellite"
        initialRegion={initialRegion}
      >
        {parcels?.map((parcel) => (
          <Geojson
            key={parcel.id}
            geojson={{
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: parcel.geometry,
                  properties: {},
                },
              ],
            }}
            strokeWidth={theme.map.defaultStrokeWidth}
            strokeColor={"white"}
            fillColor={hexToRgba(
              parcel.id in data.parcelsById
                ? theme.map.defaultFillColor
                : theme.colors.white,
              theme.map.defaultFillAlpha
            )}
            tappable
            onPress={() => onParcelToggle(parcel)}
          />
        ))}
        <HomeMarker latitude={lat} longitude={lng} />
      </MapView>
      {mapVisible && <Info />}
      <View
        style={{
          position: "absolute",
          // bottom: insets.bottom,
          // left: theme.spacing.m,
          // right: theme.spacing.m,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.background,
          paddingVertical: theme.spacing.m,
          // paddingTop: theme.spacing.m,
        }}
      >
        <Stepper totalSteps={6} currentStep={4} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: insets.bottom,
            marginHorizontal: theme.spacing.m,
          }}
        >
          <NavigationButton
            title="Zurück"
            icon="arrow-back-circle-outline"
            // disabled={setupFarmMutation.isPending}
            onPress={() => navigation.goBack()}
          />
          <NavigationButton
            title={t("buttons.next")}
            icon="arrow-forward-circle-outline"
            onPress={() => navigation.navigate("SelectCrops")}
          />
        </View>
        {/* <Button
              style={{
                shadowColor: "#2a2a2a",
                shadowOffset: { width: 2, height: 5 },
                shadowOpacity: 1,
                shadowRadius: 5,
              }}
              title={t('buttons.next')}
              onPress={() => navigation.navigate("OnboardingStep5")}
            /> */}
      </View>
    </>
  );
}
function Info() {
  const theme = useTheme();
  const frame = useSafeAreaFrame();

  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  function onDone() {
    setVisible(false);
  }
  return (
    <Card
      style={{
        position: "absolute",
        top: frame.height / 2 - 100,
        left: theme.spacing.m,
        right: theme.spacing.m,
      }}
    >
      <Title>Deine Parzellen</Title>
      <View style={{ marginTop: theme.spacing.m }}>
        <Subtitle>
          Basierend auf deiner Betriebsnummer wurden folgende Parzellen (blau)
          gefunden. Du kannst weitere auswählen oder bestehende entfernen, indem
          du auf die Parzellen drückst.
        </Subtitle>
      </View>
      <View style={{ marginTop: theme.spacing.l }}>
        <Button fontSize={16} title="Ok" onPress={onDone} />
      </View>
    </Card>
  );
}
