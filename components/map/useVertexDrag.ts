import { type MapRef } from "@maplibre/maplibre-react-native";
import { useRef, useState } from "react";
import { type GestureResponderEvent, type ViewInstance } from "react-native";
import { type DrawingOverlayRef, LAYER_IDS } from "./DrawingOverlay";

/** Hold time on a vertex or midpoint before it can be dragged */
const HOLD_DURATION_MS = 150;
/** Moving further than this during the hold means the user pans the map instead */
const HOLD_MOVE_TOLERANCE = 10;
/** The dragged vertex sits above the finger so it stays visible */
const DRAG_Y_OFFSET = 40;

type Point = { x: number; y: number };

type TouchState = {
  start: Point;
  current: Point;
  timer: ReturnType<typeof setTimeout>;
  /** Page position of the map view, known once the hold is over */
  mapOrigin?: Point;
  /** Index of the vertex being dragged */
  dragIndex?: number;
};

/**
 * Hold a vertex or midpoint of the DrawingOverlay, then drag it.
 *
 * Uses plain React Native touch events on the view wrapping the map instead of
 * a gesture handler: on Android the MapLibre view requests the touch stream for
 * itself, which cancels every react-native-gesture-handler gesture around it.
 * Spread the returned touch handlers on that wrapping view and pass dragPan to the map.
 */
export function useVertexDrag({
  enabled,
  canDrag,
  mapRef,
  mapViewRef,
  drawingRef,
}: {
  enabled: boolean;
  /** Read when the hold is over, e.g. whether the shape is in an editable state */
  canDrag: () => boolean;
  mapRef: React.RefObject<MapRef | null>;
  /** The view wrapping the map, used to turn page into map coordinates */
  mapViewRef: React.RefObject<ViewInstance | null>;
  drawingRef: React.RefObject<DrawingOverlayRef | null>;
}) {
  const [dragPan, setDragPan] = useState(true);
  const touch = useRef<TouchState | null>(null);

  function finish() {
    if (!touch.current) return;
    clearTimeout(touch.current.timer);
    const wasDragging = touch.current.dragIndex !== undefined;
    touch.current = null;
    if (wasDragging) setDragPan(true);
  }

  async function startDrag(state: TouchState) {
    const map = mapRef.current;
    const mapView = mapViewRef.current;
    if (!map || !mapView || !canDrag()) return;

    const mapOrigin = await new Promise<Point>((resolve) =>
      mapView.measure((_x, _y, _width, _height, pageX, pageY) =>
        resolve({ x: pageX, y: pageY }),
      ),
    );
    const features = await map.queryRenderedFeatures(
      [state.start.x - mapOrigin.x, state.start.y - mapOrigin.y],
      { layers: [LAYER_IDS.VERTICES, LAYER_IDS.MIDPOINTS] },
    );
    // The finger may have been lifted in the meantime
    if (touch.current !== state) return;

    const props = features[0]?.properties;
    const geometry = features[0]?.geometry;
    let index: number;
    if (props?.type === "vertex" && typeof props.index === "number") {
      index = props.index;
    } else if (
      props?.type === "midpoint" &&
      typeof props.afterIndex === "number" &&
      geometry?.type === "Point"
    ) {
      drawingRef.current?.insertVertex(props.afterIndex, [
        geometry.coordinates[0],
        geometry.coordinates[1],
      ]);
      index = props.afterIndex + 1;
    } else {
      return;
    }

    state.mapOrigin = mapOrigin;
    state.dragIndex = index;
    setDragPan(false);
    await moveVertex(state);
  }

  async function moveVertex(state: TouchState) {
    const map = mapRef.current;
    if (!map || !state.mapOrigin || state.dragIndex === undefined) return;
    const lngLat = await map.unproject([
      state.current.x - state.mapOrigin.x,
      state.current.y - state.mapOrigin.y - DRAG_Y_OFFSET,
    ]);
    if (touch.current !== state) return;
    drawingRef.current?.updateVertex(state.dragIndex, lngLat);
  }

  function onTouchStart(event: GestureResponderEvent) {
    finish();
    // A second finger means pinch or rotate, leave it to the map
    if (!enabled || event.nativeEvent.touches.length > 1) return;
    const point = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
    const state: TouchState = {
      start: point,
      current: point,
      timer: setTimeout(() => startDrag(state), HOLD_DURATION_MS),
    };
    touch.current = state;
  }

  function onTouchMove(event: GestureResponderEvent) {
    const state = touch.current;
    if (!state) return;
    if (event.nativeEvent.touches.length > 1) {
      finish();
      return;
    }
    state.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
    if (state.dragIndex !== undefined) {
      moveVertex(state);
    } else if (
      Math.hypot(
        state.current.x - state.start.x,
        state.current.y - state.start.y,
      ) > HOLD_MOVE_TOLERANCE
    ) {
      finish();
    }
  }

  return {
    dragPan,
    touchHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd: finish,
      onTouchCancel: finish,
    },
  };
}
