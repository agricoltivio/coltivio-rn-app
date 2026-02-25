import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import {
  PolylineDrawingTool,
  PolylineDrawingToolActions,
} from "@/components/map/PolylineDrawingTool";
import { hexToRgba, indexToDistinctColor } from "@/theme/theme";
import {
  cutPolygonFromMultiPolygon,
  splitMultiPolygonByLine,
} from "@/utils/geo-spatials";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { LatLng, MapPressEvent } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export type SplitModeLayersHandle = {
  handleMapPress: (event: MapPressEvent) => void;
  handlePolylineCut: () => void;
};

export const SplitModeLayers = forwardRef<SplitModeLayersHandle>(
  function SplitModeLayers(_props, ref) {
    const theme = useTheme();
    const { t } = useTranslation();
    const { mode, dispatch } = usePlotsMapContext();

    const polylineRef = useRef<PolylineDrawingToolActions>(null);
    const polygonRef = useRef<PolygonDrawingToolActions>(null);

    // Use a ref to always have the latest mode available in imperative handles
    // This avoids stale closures - the map's onPress callback and control buttons
    // call these handlers which need the latest state
    const modeRef = useRef(mode);
    modeRef.current = mode;

    useImperativeHandle(ref, () => ({
      handleMapPress(event: MapPressEvent) {
        const currentMode = modeRef.current;
        if (currentMode.type !== "split") return;
        if (currentMode.activeToolMode === "polyline") {
          event.stopPropagation();
          polylineRef.current?.drawToPoint(event.nativeEvent.coordinate);
        } else if (currentMode.activeToolMode === "polygon") {
          event.stopPropagation();
          polygonRef.current?.drawToPoint(event.nativeEvent.coordinate);
        }
      },
      handlePolylineCut() {
        const currentMode = modeRef.current;
        if (currentMode.type !== "split") return;
        const coords = polylineRef.current?.getCoordinates();
        if (!coords || coords.length < 2) {
          Alert.alert(t("plots.split.split_failed"));
          return;
        }
        const newPolygons: GeoJSON.MultiPolygon[] = [];
        for (const polygon of currentMode.currentPolygons) {
          const result = splitMultiPolygonByLine(polygon, {
            type: "LineString",
            coordinates: coords.map(({ longitude, latitude }) => [
              longitude,
              latitude,
            ]),
          });
          if (result) {
            newPolygons.push(...result);
          } else {
            newPolygons.push(polygon);
          }
        }
        dispatch({ type: "SET_SPLIT_POLYGONS", polygons: newPolygons });
        polylineRef.current?.reset();
        dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
      },
    }));

    if (mode.type !== "split") return null;

    const { currentPolygons, activeToolMode } = mode;
    const hasMultiplePolygons = currentPolygons.length >= 2;

    function handlePolygonCut(drawnCoordinates: LatLng[]) {
      const currentMode = modeRef.current;
      if (currentMode.type !== "split") return;
      if (!drawnCoordinates?.length || drawnCoordinates.length < 4) {
        Alert.alert(t("plots.split.split_failed"));
        return;
      }
      const newPolygons: GeoJSON.MultiPolygon[] = [];
      for (const currentPolygon of currentMode.currentPolygons) {
        const result = cutPolygonFromMultiPolygon(
          currentPolygon,
          drawnCoordinates,
        );
        if (result) {
          newPolygons.push(result.remaining, result.plots);
        } else {
          newPolygons.push(currentPolygon);
        }
      }
      dispatch({ type: "SET_SPLIT_POLYGONS", polygons: newPolygons });
      dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
    }

    return (
      <>
        {currentPolygons.map((geom, i) => (
          <MultiPolygon
            key={`split-poly-${i}-${currentPolygons.length}`}
            polygon={geom}
            strokeWidth={theme.map.defaultStrokeWidth}
            strokeColor="white"
            fillColor={hexToRgba(
              hasMultiplePolygons
                ? indexToDistinctColor(i)
                : theme.map.defaultFillColor,
              hasMultiplePolygons ? 0.6 : theme.map.defaultFillAlpha,
            )}
          />
        ))}
        {activeToolMode === "polyline" && (
          <PolylineDrawingTool ref={polylineRef} />
        )}
        {activeToolMode === "polygon" && (
          <PolygonDrawingTool
            ref={polygonRef}
            initialAction="draw"
            portalName="PlotsMapPortal"
            onFinish={handlePolygonCut}
            finishIcon="content-cut"
            onDrawActionChange={(action) => {
              if (action !== "draw") {
                dispatch({ type: "SET_SPLIT_TOOL", tool: "none" });
              }
            }}
          />
        )}
      </>
    );
  },
);
