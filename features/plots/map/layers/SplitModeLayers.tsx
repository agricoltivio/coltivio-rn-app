import {
  DrawingOverlay,
  type DrawingOverlayRef,
} from "@/components/map/DrawingOverlay";
import { hexToRgba, indexToDistinctColor } from "@/theme/theme";
import {
  cutPolygonFromMultiPolygonLngLat,
  extractSubPolygonByPoint,
  splitMultiPolygonByLine,
} from "@/utils/geo-spatials";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export type SplitModeLayersHandle = {
  handleMapPress: (lngLat: LngLat) => void;
  handlePolylineCut: () => void;
};

export const SplitModeLayers = forwardRef<SplitModeLayersHandle>(
  function SplitModeLayers(_props, ref) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { mode, dispatch, drawingRef } = usePlotsMapContext();

    const modeRef = useRef(mode);
    modeRef.current = mode;

    useImperativeHandle(ref, () => ({
      handleMapPress(lngLat: LngLat) {
        const currentMode = modeRef.current;
        if (currentMode.type !== "split") return;
        if (currentMode.activeToolMode === "polyline" || currentMode.activeToolMode === "polygon") {
          drawingRef.current?.handleMapTap(lngLat);
        } else if (currentMode.activeToolMode === "extract") {
          // Extract sub-polygon at tapped point
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
    }));

    const currentPolygons = mode.type === "split" ? mode.currentPolygons : [];
    const activeToolMode = mode.type === "split" ? mode.activeToolMode : "none" as const;
    const hasMultiplePolygons = currentPolygons.length >= 2;

    // Build GeoJSON for split polygons
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

    if (mode.type !== "split") return null;

    function handlePolygonCut() {
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
      dispatch({ type: "SET_SPLIT_POLYGONS", polygons: newPolygons });
      dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
    }

    const drawMode = activeToolMode === "polyline"
      ? "draw-polyline" as const
      : activeToolMode === "polygon"
        ? "draw-polygon" as const
        : "none" as const;

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

        {activeToolMode !== "none" && (
          <DrawingOverlay
            ref={drawingRef}
            mode={drawMode}
            mapRef={usePlotsMapContext().mapRef}
            onCoordinatesChange={() => {
              // When drawing completes (polygon closes), auto-cut
              if (activeToolMode === "polygon" && drawingRef.current?.isClosed()) {
                handlePolygonCut();
                drawingRef.current?.reset();
              }
            }}
          />
        )}
      </>
    );
  },
);
