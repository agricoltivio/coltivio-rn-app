import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { type BaseLayer } from "@/components/map/MapLibreMap";
import { InsetsProps } from "@/constants/Screen";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type MapLayerToggleProps = {
  baseLayer: BaseLayer;
  onToggle: (layer: BaseLayer) => void;
  /** When provided, renders top-left at this top value instead of bottom-right. */
  topOffset?: number;
};

export function MapLayerToggle({ baseLayer, onToggle, topOffset }: MapLayerToggleProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <AbsoluteView insets={insets} topOffset={topOffset}>
      <MaterialCommunityIconButton
        type="accent"
        color={theme.colors.black}
        iconSize={30}
        icon={baseLayer === "satellite" ? "map-outline" : "satellite-variant"}
        onPress={() =>
          onToggle(baseLayer === "satellite" ? "map" : "satellite")
        }
      />
    </AbsoluteView>
  );
}

type AbsoluteViewProps = InsetsProps & { topOffset?: number };

const AbsoluteView = styled.View<AbsoluteViewProps>`
  position: absolute;
  ${({ topOffset, theme, insets }) =>
    topOffset !== undefined
      ? `left: ${theme.spacing.m}px; top: ${topOffset}px;`
      : `right: ${theme.spacing.xxl}px; bottom: ${insets.bottom}px;`}
  align-items: center;
`;
