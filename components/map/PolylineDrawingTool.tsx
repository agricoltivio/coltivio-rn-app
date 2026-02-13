import { throttle } from "lodash";
import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { LatLng, Point, Polyline } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { CircleMarkers } from "./CircleMarkers";

export type PolylineDrawingToolActions = {
  drawToPoint: (coordinate: LatLng) => void;
  getCoordinates: () => LatLng[];
  undo: () => void;
  reset: () => void;
};

export type PolylineDrawingToolProps = {
  strokeColor?: string;
  strokeWidth?: number;
};

export const PolylineDrawingTool = forwardRef<
  PolylineDrawingToolActions,
  PolylineDrawingToolProps
>(({ strokeColor, strokeWidth }, ref) => {
  const theme = useTheme();
  // Single state source — coordinates derived from top of stack
  const [coordinatesStack, setCoordinatesStack] = useState<LatLng[][]>([[]]);
  const coordinates = coordinatesStack[coordinatesStack.length - 1];

  // Overlay coordinates shown while dragging (throttled updates for smooth feedback)
  const [dragOverlay, setDragOverlay] = useState<LatLng[] | null>(null);

  const throttledDragUpdate = useMemo(
    () =>
      throttle(
        (index: number, coordinate: LatLng) => {
          setDragOverlay((prev) => {
            const updated = [...(prev ?? coordinates)];
            updated[index] = coordinate;
            return updated;
          });
        },
        50,
        { leading: true, trailing: false },
      ),
    [],
  );

  const resolvedStrokeColor = strokeColor ?? theme.colors.yellow;
  const resolvedStrokeWidth = strokeWidth ?? 2;

  useImperativeHandle(
    ref,
    () => ({
      drawToPoint(coordinate: LatLng) {
        setCoordinatesStack((prev) => [
          ...prev,
          [...prev[prev.length - 1], coordinate],
        ]);
      },
      getCoordinates() {
        return coordinates;
      },
      undo() {
        setCoordinatesStack((prev) =>
          prev.length <= 1 ? prev : prev.slice(0, -1),
        );
      },
      reset() {
        setCoordinatesStack([[]]);
      },
    }),
    [coordinates],
  );

  return (
    <>
      <Polyline
        coordinates={dragOverlay ?? coordinates}
        fillColor={resolvedStrokeColor}
        strokeWidth={resolvedStrokeWidth}
      />
      {coordinates.length > 0 && (
        <CircleMarkers
          coordinates={coordinates}
          onDragStart={(index) => {
            setDragOverlay([...coordinates]);
          }}
          onDrag={(index, coordinate) => {
            throttledDragUpdate(index, coordinate);
          }}
          onDragEnd={(index, coordinate) => {
            setDragOverlay(null);
            setCoordinatesStack((prev) => {
              const updated = [...prev[prev.length - 1]];
              updated[index] = coordinate;
              return [...prev, updated];
            });
          }}
        />
      )}
    </>
  );
});
