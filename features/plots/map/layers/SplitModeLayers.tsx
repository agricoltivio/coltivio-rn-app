import {
  DrawingOverlay,
  type DrawingOverlayRef,
} from "@/components/map/DrawingOverlay";
import { hexToRgba, indexToDistinctColor } from "@/theme/theme";
import {
  GeoSpatials,
  cutPolygonFromMultiPolygonLngLat,
  extractSubPolygonByPoint,
  splitMultiPolygonByLine,
} from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export type SplitModeLayersHandle = {
  handleMapPress: (lngLat: LngLat) => void;
  handlePolylineCut: () => void;
  handlePolygonCut: () => void;
};

export const SplitModeLayers = forwardRef<SplitModeLayersHandle>(
  function SplitModeLayers(_props, ref) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { mode, dispatch, drawingRef, mapRef } = usePlotsMapContext();

    const modeRef = useRef(mode);
    modeRef.current = mode;

    // Tracks the drawn polygon's coordinates during the polygon-edit phase for size label
    const [drawnPolygonCoords, setDrawnPolygonCoords] = useState<LngLat[] | null>(null);

    const currentPolygons = mode.type === "split" ? mode.currentPolygons : [];
    const activeToolMode = mode.type === "split" ? mode.activeToolMode : "none" as const;
    const hasMultiplePolygons = currentPolygons.length >= 2;

    // Size labels shown at the centroid of each split result polygon
    const splitLabelsData = useMemo((): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: currentPolygons.map((geom) => {
        const area = round(turf.area(geom), 0);
        const centroid = turf.centroid(geom);
        return {
          type: "Feature",
          properties: { label: `${area / 100}a` },
          geometry: centroid.geometry,
        };
      }),
    }), [currentPolygons]);

    // Size label for the polygon being edited in polygon-edit mode
    const drawnPolygonLabelData = useMemo((): GeoJSON.FeatureCollection => {
      if (activeToolMode !== "polygon-edit" || !drawnPolygonCoords || drawnPolygonCoords.length < 3) {
        return { type: "FeatureCollection", features: [] };
      }
      const poly = GeoSpatials.lngLatToMultiPolygon([drawnPolygonCoords]);
      const area = round(turf.area(poly), 0);
      const centroid = turf.centroid(poly);
      return {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { label: `${area / 100}a` },
          geometry: centroid.geometry,
        }],
      };
    }, [activeToolMode, drawnPolygonCoords]);

    // GeoJSON for the split polygon fills
    const splitFeatureCollection = useMemo((): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: currentPolygons.map((geom, i) => ({
        type: "Feature",
        properties: {
          color: hasMultiplePolygons
            ? indexToDistinctColor(i)
            : hexToRgba(theme.map.defaultFillColor, theme.map.defaultFillAlpha),
          opacity: hasMultiplePolygons ? 0.6 : theme.map.defaultFillAlpha,
        },
        geometry: geom,
      })),
    }), [currentPolygons, hasMultiplePolygons, theme]);

    useImperativeHandle(ref, () => ({
      handleMapPress(lngLat: LngLat) {
        const currentMode = modeRef.current;
        if (currentMode.type !== "split") return;
        if (
          currentMode.activeToolMode === "polyline" ||
          currentMode.activeToolMode === "polygon" ||
          currentMode.activeToolMode === "polygon-edit"
        ) {
          drawingRef.current?.handleMapTap(lngLat);
        } else if (currentMode.activeToolMode === "extract") {
          const point = { longitude: lngLat[0], latitude: lngLat[1] };
          const newPolygons: GeoJSON.MultiPolygon[] = [];
          let didExtract = false;
          for (const polygon of currentMode.currentPolygons) {
            const result = extractSubPolygonByPoint(polygon, point);
            if (result) {
              newPolygons.push(result.remaining, result.extracted);
              didExtract = true;
            } else {
              newPolygons.push(polygon);
            }
          }
          if (didExtract) {
            dispatch({ type: "SET_SPLIT_POLYGONS", polygons: newPolygons });
            dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
          }
        }
      },
      handlePolylineCut() {
        const currentMode = modeRef.current;
        if (currentMode.type !== "split") return;
        const coords = drawingRef.current?.getCoordinates();
        if (!coords || coords.length < 2) {
          Alert.alert(t("plots.split.split_failed"));
          return;
        }
        const newPolygons: GeoJSON.MultiPolygon[] = [];
        for (const polygon of currentMode.currentPolygons) {
          const result = splitMultiPolygonByLine(polygon, {
            type: "LineString",
            coordinates: coords,
          });
          if (result) {
            newPolygons.push(...result);
          } else {
            newPolygons.push(polygon);
          }
        }
        dispatch({ type: "SET_SPLIT_POLYGONS", polygons: newPolygons });
        drawingRef.current?.reset();
        dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
      },
      handlePolygonCut() {
        const currentMode = modeRef.current;
        if (currentMode.type !== "split") return;
        const coords = drawingRef.current?.getCoordinates();
        if (!coords || coords.length < 3) {
          Alert.alert(t("plots.split.split_failed"));
          return;
        }
        const newPolygons: GeoJSON.MultiPolygon[] = [];
        for (const currentPolygon of currentMode.currentPolygons) {
          const result = cutPolygonFromMultiPolygonLngLat(currentPolygon, coords);
          if (result) {
            newPolygons.push(result.remaining, result.plots);
          } else {
            newPolygons.push(currentPolygon);
          }
        }
        setDrawnPolygonCoords(null);
        dispatch({ type: "SET_SPLIT_POLYGONS", polygons: newPolygons });
        dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
      },
    }));

    if (mode.type !== "split") return null;

    const drawMode: "draw-polygon" | "draw-polyline" | "edit" | "none" =
      activeToolMode === "polyline" ? "draw-polyline" :
      activeToolMode === "polygon" ? "draw-polygon" :
      activeToolMode === "polygon-edit" ? "edit" :
      "none";

    const labelLayerPaint = {
      "text-color": "#FFFFFF",
      "text-halo-color": "#000000",
      "text-halo-width": 2,
    };

    return (
      <>
        <GeoJSONSource id="split-polygons" data={splitFeatureCollection}>
          <Layer
            type="fill"
            id="split-fill"
            paint={{
              "fill-color": ["get", "color"],
              "fill-opacity": ["get", "opacity"],
            }}
          />
          <Layer
            type="line"
            id="split-stroke"
            paint={{
              "line-color": "white",
              "line-width": theme.map.defaultStrokeWidth,
            }}
          />
        </GeoJSONSource>

        {/* Size labels for each split result polygon */}
        <GeoJSONSource id="split-labels" data={splitLabelsData}>
          <Layer
            type="symbol"
            id="split-labels-text"
            layout={{
              "text-field": ["get", "label"],
              "text-size": 14,
              "text-anchor": "center",
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            }}
            paint={labelLayerPaint}
          />
        </GeoJSONSource>

        {/* Drawing overlay — only during active drawing/editing phases */}
        {(activeToolMode === "polyline" || activeToolMode === "polygon" || activeToolMode === "polygon-edit") && (
          <DrawingOverlay
            ref={drawingRef}
            mode={drawMode}
            mapRef={mapRef}
            onCoordinatesChange={(coords, closed) => {
              if (activeToolMode === "polygon" && closed) {
                // Polygon closed during draw → enter edit mode so user can adjust vertices before cutting
                dispatch({ type: "SET_SPLIT_TOOL", tool: "polygon-edit" });
              } else if (activeToolMode === "polygon-edit" && !closed) {
                // Undo reopened the polygon → go back to draw mode
                dispatch({ type: "SET_SPLIT_TOOL", tool: "polygon" });
                setDrawnPolygonCoords(null);
                return;
              }
              if (closed && coords.length >= 3) {
                setDrawnPolygonCoords(coords);
              }
            }}
          />
        )}

        {/* Size label for the polygon being edited */}
        <GeoJSONSource id="drawn-polygon-label" data={drawnPolygonLabelData}>
          <Layer
            type="symbol"
            id="drawn-polygon-label-text"
            layout={{
              "text-field": ["get", "label"],
              "text-size": 14,
              "text-anchor": "center",
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            }}
            paint={labelLayerPaint}
          />
        </GeoJSONSource>
      </>
    );
  },
);
