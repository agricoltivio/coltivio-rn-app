import { debounce } from "lodash";
import * as turf from "@turf/turf";
import React from "react";
import {
  LatLng,
  MapPolygonProps,
  Marker,
  MarkerPressEvent,
  Point,
} from "react-native-maps";
import { Circle } from "./Circle";

type MarkerHandlers = {
  onDragStart?: (
    markerIndex: number,
    coordinate: LatLng,
    position?: Point
  ) => void;
  onDrag?: (markerIndex: number, coordinate: LatLng, position: Point) => void;
  onDragEnd?: (
    markerIndex: number,
    coordinate: LatLng,
    position?: Point
  ) => void;
  onPress?: (markerIndex: number, coordinate: LatLng) => void;
};

type CircleMarkerProps = {
  markerIndex: number;
  coordinate: LatLng;
  strokeColor: string;
} & MarkerHandlers;

function CircleMarker({
  markerIndex,
  strokeColor,
  coordinate,
  onDrag,
  onDragStart,
  onDragEnd,
  onPress,
}: CircleMarkerProps) {
  return (
    <Marker
      isPreselected
      identifier={markerIndex.toString()}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0.5, y: 0.5 }}
      draggable
      stopPropagation
      tracksViewChanges={false}
      onDragStart={(e) =>
        onDragStart &&
        onDragStart(
          markerIndex,
          e.nativeEvent.coordinate,
          e.nativeEvent.position
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
      // onSelect={(e) =>
      //   onPress && onPress(markerIndex, e.nativeEvent.coordinate)
      // }
    >
      <Circle size={20} color={strokeColor} />
    </Marker>
  );
}

type CircleMarkersProps = {
  coordinates: LatLng[];
} & MarkerHandlers;

export const CircleMarkers = ({
  coordinates,
  onDrag,
  onDragStart,
  onDragEnd,
  onPress,
}: CircleMarkersProps) => {
  return coordinates.map((coordinate: LatLng, coordIndex: number) =>
    coordinate ? (
      <CircleMarker
        key={coordIndex}
        markerIndex={coordIndex}
        coordinate={coordinate}
        strokeColor={"white"}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPress={onPress}
      />
    ) : null
  );
};
