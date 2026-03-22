import { Ionicons } from "@expo/vector-icons";
import { Marker, type LngLat } from "@maplibre/maplibre-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

type HomeMarkerLayerProps = {
  center: LngLat;
};

export function HomeMarkerLayer({ center }: HomeMarkerLayerProps) {
  return (
    <Marker id="home-marker" lngLat={center}>
      <View style={styles.marker}>
        <Ionicons name="home" size={18} color="#5c3d2e" />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#efd8c2",
    borderWidth: 1,
    borderColor: "#b89a7d",
    alignItems: "center",
    justifyContent: "center",
  },
});
