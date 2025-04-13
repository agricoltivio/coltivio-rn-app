import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Marker } from "react-native-maps";
import styled from "styled-components/native";

interface HomeMarkerLayerProps {
  latitude: number;
  longitude: number;
}

const ICON_SIZE = 18;
const ICON_WRAPPER_SIZE = 35;

export const HomeMarker = ({ ...props }: HomeMarkerLayerProps) => {
  return (
    <Marker key="home-marker" coordinate={{ ...props }}>
      <Circle>
        <Ionicons name="home" size={ICON_SIZE} color="black" />
      </Circle>
    </Marker>
  );
};

const Circle = styled.View`
  align-items: center;
  justify-content: center;
  width: ${ICON_WRAPPER_SIZE}px;
  height: ${ICON_WRAPPER_SIZE}px;
  border-radius: ${({ theme }) => theme.radii.xxl}px;
  background-color: #efd8c2;
`;
