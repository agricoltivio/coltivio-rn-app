import { MapView } from "@/components/map/Map";
import { deviceHeight, deviceWidth } from "@/constants/Screen";
import { TopLeftBackButton } from "@/features/map/TopLeftBackButton";
import { MapShowLocationToggle } from "@/features/map/MapShowLocationToggle";
import { PortalHost } from "@gorhom/portal";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Region } from "react-native-maps";
import styled from "styled-components/native";
import { MapActionButton, MapActionType } from "./MapActionButton";
import { ParcelLayer } from "./layers/ParcelLayer";
import { MapControls } from "./overlays/MapControls";

export function MapScreen() {
  // TODO: This should come from persistant storage after onboarding!
  const initialRegion: Region = {
    latitude: 46.307513,
    longitude: 9.123333,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };

  const [showsUserLocation, setShowsUserLocation] = useState<boolean>(false);
  const [mapAction, setMapAction] = useState<MapActionType | null>(null);

  function handleMapActionSelected(action: MapActionType) {
    setMapAction(action);
  }

  return (
    <MapContainer>
      <MapView
        style={styles.map}
        mapType="satellite"
        showsUserLocation={showsUserLocation}
        followsUserLocation={true}
        initialRegion={initialRegion}
      >
        {mapAction === MapActionType.MANAGE_PARCELS && <ParcelLayer />}
      </MapView>
      <PortalHost name="map-overlays" />
      <MapActionButton onMapActionSelected={handleMapActionSelected} />
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <TopLeftBackButton />
      <MapControls></MapControls>
    </MapContainer>
  );
}

const MapContainer = styled.View`
  justify-content: center;
  align-items: center;
  width: ${deviceWidth}px;
  height: ${deviceHeight}px;
`;

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
