import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { hexToRgba } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { useFarmPlotsQuery } from "../plots/plots.hooks";

export const MapTile = ({ showMap = true }: { showMap?: boolean }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();

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
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        // shadowColor: theme.colors.gray3,
        // shadowOffset: { width: 2, height: 5 },
        // shadowOpacity: 0.4,
        // shadowRadius: 5,
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate("PlotsMap", {})}
      >
        <View
          style={{
            width: "100%",
            height: 250,
            overflow: "hidden",
            // shadowColor: theme.colors.gray3,
            // shadowOffset: { width: 2, height: 5 },
            // shadowOpacity: 0.4,
            // shadowRadius: 5,
            borderRadius: 10,
          }}
        >
          <MapView
            style={{
              ...StyleSheet.absoluteFillObject,
            }}
            loading={!showMap}
            mapType="satellite"
            initialRegion={initialRegion}
            scrollEnabled={false}
          >
            {plots.map((plot) => (
              <MultiPolygon
                key={plot.id}
                polygon={plot.geometry}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor={"white"}
                fillColor={hexToRgba(
                  theme.map.defaultFillColor,
                  theme.map.defaultFillAlpha,
                )}
                tappable
              />
            ))}
            <HomeMarker latitude={latitude} longitude={longitude} />
          </MapView>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};
