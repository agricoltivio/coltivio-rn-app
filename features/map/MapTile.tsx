import { Ionicons } from "@expo/vector-icons";
import { StaticMapPreview } from "@/components/map/StaticMapPreview";
import { type LngLat } from "@maplibre/maplibre-react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { useFarmPlotsQuery } from "../plots/plots.hooks";

export const MapTile = ({ showMap = true }: { showMap?: boolean }) => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();

  const features = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: (plots ?? []).map((plot) => ({
        type: "Feature",
        properties: {},
        geometry: plot.geometry,
      })),
    }),
    [plots],
  );

  if (!farm || !plots) {
    return null;
  }

  const center = farm.location.coordinates as LngLat;

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
        {showMap && (
          <StaticMapPreview
            center={center}
            zoom={15}
            features={features}
            height={250}
          />
        )}
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
          <Ionicons
            name="expand-outline"
            size={28}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
