import { deviceWidth } from "@/constants/Screen";
import React from "react";
import { createContext, useContext, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import RnMapView, {
  Details,
  LatLng,
  MapPressEvent,
  MapViewProps,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useTheme } from "styled-components/native";

interface MapContextProps {
  region: Region;
  selectedCoordinate: LatLng | null;
  zoom: number;
}

const MapContext = createContext<MapContextProps>({
  region: {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  },
  zoom: 0,
  selectedCoordinate: null,
});

export type MapProps = MapViewProps & {
  initialRegion: Region;
  loading?: boolean;
};

function calculateZoomLevel(longitudeDelta: number) {
  return Math.log2(360 * (deviceWidth / 256 / longitudeDelta)) + 1;
}

export const MapView = ({ loading, ...props }: MapProps) => {
  const theme = useTheme();
  // const [region, setRegion] = useState<Region>(initialRegion);
  // const [selectedCoordinate, setSelectedCoordinate] = useState<LatLng | null>(
  //   null
  // );
  // const [zoom, setZoom] = useState<number>(
  //   calculateZoomLevel(initialRegion.longitudeDelta)
  // );

  // function handleOnRegionChangeComplete(region: Region, details: Details) {
  //   setRegion(region);
  //   if (onRegionChangeComplete) {
  //     onRegionChangeComplete(region, details);
  //     setZoom(calculateZoomLevel(region.longitudeDelta));
  //   }
  // }

  // function handleOnPress(event: MapPressEvent) {
  //   setSelectedCoordinate(event.nativeEvent.coordinate);
  //   onPress && onPress(event);
  // }

  return (
    // <MapContext.Provider value={{ region, zoom, selectedCoordinate }}>
    <>
      {!loading && (
        <RnMapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          // onPress={handleOnPress}
          // initialRegion={initialRegion}
          // onRegionChangeComplete={handleOnRegionChangeComplete}
          loadingIndicatorColor={theme.colors.secondary}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          mapType="satellite"
          showsCompass={false}
          rotateEnabled={false}
          {...props}
        />
      )}
      {loading && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject, // Covers the entire screen
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.secondary} />
        </View>
      )}
      {/* </MapContext.Provider> */}
    </>
  );
};

export function useMap() {
  return useContext(MapContext);
}

const styles = StyleSheet.create({
  map: {
    // ...StyleSheet.absoluteFillObject,
    flex: 1,
    width: "100%",
  },
});
