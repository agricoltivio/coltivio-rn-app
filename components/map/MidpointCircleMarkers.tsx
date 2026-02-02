import { GeoSpatials } from "@/utils/geo-spatials";
import React from "react";
import { StyleSheet, View } from "react-native";
import { LatLng, Marker, Point } from "react-native-maps";
import { useTheme } from "styled-components/native";

type MarkerHandlers = {
  onDragStart?: (
    markerIndex: number,
    coordinate: LatLng,
    position?: Point,
  ) => void;
  onDrag?: (markerIndex: number, coordinate: LatLng, position: Point) => void;
  onDragEnd?: (
    markerIndex: number,
    coordinate: LatLng,
    position?: Point,
  ) => void;
  onPress?: (markerIndex: number, coordinate: LatLng) => void;
};

type MidpointCircleMarkerProps = {
  markerIndex: number;
  coordinate: LatLng;
  strokeColor: string;
} & MarkerHandlers;

const getMiddleCoordinates = (coordinates: LatLng[]): LatLng[] => {
  if (coordinates.length < 2) return [];
  const middleCoordinates = [];
  for (let i = 1; i < coordinates.length; i++) {
    const coordinate = GeoSpatials.getMidpointFromCoordinates(
      coordinates[i - 1],
      coordinates[i],
    );
    middleCoordinates.push(coordinate);
  }
  middleCoordinates.push(
    GeoSpatials.getMidpointFromCoordinates(
      coordinates[0],
      coordinates[coordinates.length - 1],
    ),
  );
  return middleCoordinates;
};

function MidpointCircleMarker({
  markerIndex,
  strokeColor,
  coordinate,
  onDrag,
  onDragStart,
  onDragEnd,
  onPress,
}: MidpointCircleMarkerProps) {
  return (
    <Marker
      isPreselected
      identifier={markerIndex.toString()}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      draggable
      stopPropagation
      onDragStart={(e) =>
        onDragStart &&
        onDragStart(
          markerIndex,
          e.nativeEvent.coordinate,
          e.nativeEvent.position,
        )
      }
      onDrag={(e) =>
        onDrag &&
        onDrag(markerIndex, e.nativeEvent.coordinate, e.nativeEvent.position)
      }
      onDragEnd={(e) =>
        onDragEnd &&
        onDragEnd(markerIndex, e.nativeEvent.coordinate, e.nativeEvent.position)
      }
      onPress={(e) => onPress && onPress(markerIndex, e.nativeEvent.coordinate)}
      tracksViewChanges={true}
    >
      <View
        style={[
          styles.subCircleMarker,
          {
            borderColor: strokeColor,
          },
        ]}
      />
    </Marker>
  );
}

type CircleMarkersProps = {
  coordinates: LatLng[];
} & MarkerHandlers;

export const MidpointCircleMarkers = ({
  coordinates,
  onDrag,
  onDragStart,
  onDragEnd,
  onPress,
}: CircleMarkersProps) => {
  const theme = useTheme();
  const middleCoordinates = getMiddleCoordinates(coordinates);

  return middleCoordinates.map((coordinate: LatLng, coordIndex: number) => (
    <MidpointCircleMarker
      key={coordIndex}
      markerIndex={coordIndex + 1}
      coordinate={coordinate}
      strokeColor={theme.colors.white}
      onDrag={onDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPress={onPress}
    />
  ));
};

const styles = StyleSheet.create({
  subCircleMarker: {
    backgroundColor: "rgba(255, 255, 255, .5)",
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: "dotted",
    padding: 20,
  },
});
