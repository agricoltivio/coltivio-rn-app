import { Ionicons } from "@expo/vector-icons";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { hexToRgba } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
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
      }}
    >
      <View
        style={{
          width: "100%",
          height: 250,
          overflow: "hidden",
          borderRadius: 10,
        }}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            loading={!showMap}
            mapType="satellite"
            region={initialRegion}
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
        {/* Expand button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("PlotsMap", {})}
          activeOpacity={0.8}
          style={{
            position: "absolute",
            bottom: theme.spacing.xs,
            right: theme.spacing.xs,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 8,
            padding: theme.spacing.xxs,
          }}
        >
          <Ionicons name="expand-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
