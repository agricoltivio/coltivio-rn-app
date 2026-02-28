import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { type BaseLayer } from "@/components/map/MapLibreMap";
import { InsetsProps } from "@/constants/Screen";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type MapLayerToggleProps = {
  baseLayer: BaseLayer;
  onToggle: (layer: BaseLayer) => void;
};

export function MapLayerToggle({ baseLayer, onToggle }: MapLayerToggleProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <AbsoluteView insets={insets}>
      <MaterialCommunityIconButton
        type="accent"
        color={theme.colors.black}
        iconSize={30}
        icon={baseLayer === "satellite" ? "map-outline" : "satellite-variant"}
        onPress={() => onToggle(baseLayer === "satellite" ? "map" : "satellite")}
      />
    </AbsoluteView>
  );
}

const AbsoluteView = styled.View<InsetsProps>`
  position: absolute;
  right: ${({ theme }) => theme.spacing.m}px;
  bottom: ${({ insets, theme }) => insets.bottom + theme.spacing.s}px;
  align-items: center;
`;
