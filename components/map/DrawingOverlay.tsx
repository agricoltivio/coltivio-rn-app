import {
  GeoJSONSource,
  Layer,
  type MapRef,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// --- Types ---

type DrawMode = "none" | "draw-polygon" | "draw-polyline" | "edit";

export type DrawingOverlayRef = {
  getCoordinates(): LngLat[];
  isClosed(): boolean;
  reset(): void;
  undo(): void;
  handleMapTap(lngLat: LngLat): void;
  updateVertex(index: number, lngLat: LngLat): void;
  insertVertex(afterIndex: number, lngLat: LngLat): void;
  /** Load existing coordinates as a closed polygon for editing */
  loadCoordinates(coords: LngLat[]): void;
};

type DrawingOverlayProps = {
  mode: DrawMode;
  mapRef: React.RefObject<MapRef | null>;
  onCoordinatesChange?: (coordinates: LngLat[], closed: boolean) => void;
};

// --- Helpers ---

/** Close threshold in meters — works across zoom levels, 5m is ~15-30px at typical farm zoom */
const CLOSE_THRESHOLD_METERS = 5;

function buildVerticesCollection(
  coordinates: LngLat[],
  closed: boolean,
  isPolygon: boolean,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: coordinates.map((coord, index) => ({
      type: "Feature",
      properties: {
        index,
        type: "vertex",
        isFirst: index === 0 && !closed && coordinates.length >= 3 && isPolygon ? 1 : 0,
      },
      geometry: { type: "Point", coordinates: coord },
    })),
  };
}

function buildMidpointsCollection(
  coordinates: LngLat[],
  closed: boolean,
): GeoJSON.FeatureCollection {
  if (coordinates.length < 2)
    return { type: "FeatureCollection", features: [] };

  const points: GeoJSON.Feature[] = [];
  const count = closed ? coordinates.length : coordinates.length - 1;
  for (let i = 0; i < count; i++) {
    const a = coordinates[i];
    const b = coordinates[(i + 1) % coordinates.length];
    const mid = turf.midpoint(turf.point(a), turf.point(b));
    points.push({
      type: "Feature",
      properties: { afterIndex: i, type: "midpoint" },
      geometry: mid.geometry,
    });
  }
  return { type: "FeatureCollection", features: points };
}

function buildShapeCollection(
  coordinates: LngLat[],
  closed: boolean,
): GeoJSON.FeatureCollection {
  if (coordinates.length === 0)
    return { type: "FeatureCollection", features: [] };

  if (!closed || coordinates.length < 3) {
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates:
              coordinates.length === 1
                ? [coordinates[0], coordinates[0]]
                : coordinates,
          },
        },
      ],
    };
  }

  const ring = [...coordinates, coordinates[0]];
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [ring] },
      },
      {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: ring },
      },
    ],
  };
}

// Layer IDs exported so parent can use them with queryRenderedFeatures
export const LAYER_IDS = {
  FILL: "drawing-fill",
  STROKE: "drawing-stroke",
  VERTICES: "drawing-vertices",
  MIDPOINTS: "drawing-midpoints",
} as const;

// --- Component ---

export const DrawingOverlay = forwardRef<DrawingOverlayRef, DrawingOverlayProps>(
  function DrawingOverlay({ mode, onCoordinatesChange }, ref) {
    const [coordinates, setCoordinates] = useState<LngLat[]>([]);
    const [closed, setClosed] = useState(false);

    // Undo stack: each entry is a snapshot of { coordinates, closed }
    const undoStackRef = useRef<Array<{ coords: LngLat[]; closed: boolean }>>([]);

    // Refs so imperative methods always read latest state without stale closures
    const coordsRef = useRef(coordinates);
    coordsRef.current = coordinates;
    const closedRef = useRef(closed);
    closedRef.current = closed;

    const isDrawing = mode === "draw-polygon" || mode === "draw-polyline";
    const isActive = isDrawing || mode === "edit";

    const shapeData = useMemo(
      () => buildShapeCollection(coordinates, closed),
      [coordinates, closed],
    );
    const isPolygon = mode === "draw-polygon";
    const verticesData = useMemo(
      () => buildVerticesCollection(coordinates, closed, isPolygon),
      [coordinates, closed, isPolygon],
    );
    const midpointsData = useMemo(
      () => buildMidpointsCollection(coordinates, closed),
      [coordinates, closed],
    );

    // Push current state to undo stack before any mutation
    function pushUndo() {
      undoStackRef.current.push({
        coords: [...coordsRef.current],
        closed: closedRef.current,
      });
    }

    function notifyChange(newCoords: LngLat[], newClosed: boolean) {
      onCoordinatesChange?.(newCoords, newClosed);
    }

    // Stable ref — no dependencies on coordinates/closed, reads from refs instead
    useImperativeHandle(
      ref,
      () => ({
        getCoordinates() {
          return [...coordsRef.current];
        },
        isClosed() {
          return closedRef.current;
        },
        reset() {
          undoStackRef.current = [];
          setCoordinates([]);
          setClosed(false);
          notifyChange([], false);
        },
        undo() {
          const prev = undoStackRef.current.pop();
          if (!prev) return;
          setCoordinates(prev.coords);
          setClosed(prev.closed);
          notifyChange(prev.coords, prev.closed);
        },
        handleMapTap(lngLat: LngLat) {
          if (closedRef.current) return;

          // Check if tap is near first vertex to close the polygon
          if (mode === "draw-polygon" && coordsRef.current.length >= 3) {
            const first = coordsRef.current[0];
            const dist = turf.distance(turf.point(first), turf.point(lngLat), {
              units: "meters",
            });
            if (dist < CLOSE_THRESHOLD_METERS) {
              pushUndo();
              setClosed(true);
              notifyChange(coordsRef.current, true);
              return;
            }
          }

          pushUndo();
          const newCoords = [...coordsRef.current, lngLat];
          setCoordinates(newCoords);
          notifyChange(newCoords, closedRef.current);
        },
        updateVertex(index: number, lngLat: LngLat) {
          setCoordinates((prev) => {
            const next = [...prev];
            next[index] = lngLat;
            return next;
          });
        },
        insertVertex(afterIndex: number, lngLat: LngLat) {
          setCoordinates((prev) => {
            const next = [...prev];
            next.splice(afterIndex + 1, 0, lngLat);
            return next;
          });
        },
        loadCoordinates(coords: LngLat[]) {
          undoStackRef.current = [];
          setCoordinates(coords);
          setClosed(true);
          notifyChange(coords, true);
        },
      }),
      [mode, onCoordinatesChange],
    );

    if (!isActive || coordinates.length === 0) return null;

    return (
      <>
        {/* Shape fill + stroke */}
        <GeoJSONSource id="drawing-shape" data={shapeData}>
          <Layer
            type="fill"
            id={LAYER_IDS.FILL}
            filter={["==", ["geometry-type"], "Polygon"]}
            paint={{ "fill-color": "#4CAF50", "fill-opacity": 0.25 }}
          />
          <Layer
            type="line"
            id={LAYER_IDS.STROKE}
            paint={{ "line-color": "#4CAF50", "line-width": 3 }}
          />
        </GeoJSONSource>

        {/* Vertices */}
        <GeoJSONSource id="drawing-vertices" data={verticesData}>
          <Layer
            type="circle"
            id={LAYER_IDS.VERTICES}
            paint={{
              "circle-radius": [
                "case",
                ["==", ["get", "isFirst"], 1],
                12,
                8,
              ],
              "circle-color": [
                "case",
                ["==", ["get", "isFirst"], 1],
                "#4CAF50",
                "#FFFFFF",
              ],
              "circle-stroke-color": "#4CAF50",
              "circle-stroke-width": 3,
            }}
          />
        </GeoJSONSource>

        {/* Midpoints — shown once the polygon is closed */}
        {closed && coordinates.length >= 2 ? (
          <GeoJSONSource id="drawing-midpoints" data={midpointsData}>
            <Layer
              type="circle"
              id={LAYER_IDS.MIDPOINTS}
              paint={{
                "circle-radius": 5,
                "circle-color": "#4CAF50",
                "circle-opacity": 0.6,
                "circle-stroke-color": "#FFFFFF",
                "circle-stroke-width": 1.5,
              }}
            />
          </GeoJSONSource>
        ) : null}
      </>
    );
  },
);
