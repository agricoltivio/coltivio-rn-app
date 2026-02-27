import { DrawingOverlay } from "@/components/map/DrawingOverlay";
import { PlotsLayer } from "@/components/map/PlotsLayer";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export type CreateModeLayersHandle = {
  handleMapPress: (lngLat: LngLat) => void;
};

export const CreateModeLayers = forwardRef<CreateModeLayersHandle>(
  function CreateModeLayers(_props, ref) {
    const theme = useTheme();
    const { mode, dispatch, plots, mapRef, drawingRef, navigation } = usePlotsMapContext();

    useImperativeHandle(ref, () => ({
      handleMapPress(lngLat: LngLat) {
        if (mode.type !== "create") return;
        if (mode.drawingAction === "draw") {
          drawingRef.current?.handleMapTap(lngLat);
        }
      },
    }));

    const drawingAction = mode.type === "create" ? mode.drawingAction : "draw";
    const newPolygon = mode.type === "create" ? mode.newPolygon : undefined;

    // Info card for new polygon — shown in select and edit modes
    const infoLabelData = useMemo((): GeoJSON.FeatureCollection => {
      if (!newPolygon || drawingAction === "draw") {
        return { type: "FeatureCollection", features: [] };
      }
      const label = newPolygon.localId
        ? `${newPolygon.localId} (${newPolygon.size / 100}a)`
        : `${newPolygon.size / 100}a`;
      return {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: { label },
          geometry: newPolygon.centroid,
        }],
      };
    }, [newPolygon, drawingAction]);

    // New polygon preview when in select mode
    const newPolygonData = useMemo((): GeoJSON.FeatureCollection => {
      if (!newPolygon || drawingAction !== "select") {
        return { type: "FeatureCollection", features: [] };
      }
      return {
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          properties: {},
          geometry: newPolygon.geometry,
        }],
      };
    }, [newPolygon, drawingAction]);

    if (mode.type !== "create") return null;

    function onDrawingComplete(coordinates: LngLat[], closed: boolean) {
      if (!closed || coordinates.length < 3) return;
      const polygon = GeoSpatials.lngLatToMultiPolygon([coordinates]);
      const centroid = turf.centroid(polygon);
      const area = turf.area(polygon);
      dispatch({
        type: "SET_CREATE_POLYGON",
        polygon: {
          geometry: polygon,
          centroid: centroid.geometry,
          size: round(area, 0),
        },
      });
      // Auto-enter edit mode so user can adjust vertices immediately
      dispatch({ type: "SET_CREATE_ACTION", action: "edit" });
    }

    function onSelectPolygon() {
      if (drawingAction === "select" && newPolygon) {
        // Load the polygon back for editing
        const outerRing = newPolygon.geometry.coordinates[0]?.[0];
        if (!outerRing || outerRing.length < 4) return;
        const coords: LngLat[] = outerRing.slice(0, -1).map((c) => [c[0], c[1]] as LngLat);
        drawingRef.current?.loadCoordinates(coords);
        dispatch({ type: "SET_CREATE_ACTION", action: "edit" });
      }
    }

    return (
      <>
        {/* Background: existing plots dimmed */}
        <PlotsLayer plots={plots} />

        {/* New polygon preview in select mode */}
        {newPolygon && drawingAction === "select" ? (
          <>
            <GeoJSONSource id="create-preview" data={newPolygonData} onPress={onSelectPolygon}>
              <Layer
                type="fill"
                id="create-preview-fill"
                paint={{
                  "fill-color": theme.colors.success,
                  "fill-opacity": theme.map.defaultFillAlpha,
                }}
              />
              <Layer
                type="line"
                id="create-preview-stroke"
                paint={{ "line-color": "white", "line-width": theme.map.defaultStrokeWidth }}
              />
            </GeoJSONSource>
            <GeoJSONSource id="create-info-label" data={infoLabelData}>
              <Layer
                type="symbol"
                id="create-info-label-text"
                layout={{
                  "text-field": ["get", "label"],
                  "text-size": 14,
                  "text-anchor": "center",
                  "text-allow-overlap": true,
                  "text-ignore-placement": true,
                }}
                paint={{
                  "text-color": "#FFFFFF",
                  "text-halo-color": "#000000",
                  "text-halo-width": 2,
                }}
              />
            </GeoJSONSource>
          </>
        ) : null}

        {/* Info label in edit mode (above drawing overlay) */}
        {newPolygon && drawingAction === "edit" && (
          <GeoJSONSource id="create-info-label-edit" data={infoLabelData}>
            <Layer
              type="symbol"
              id="create-info-label-edit-text"
              layout={{
                "text-field": ["get", "label"],
                "text-size": 14,
                "text-anchor": "center",
                "text-allow-overlap": true,
                "text-ignore-placement": true,
              }}
              paint={{
                "text-color": "#FFFFFF",
                "text-halo-color": "#000000",
                "text-halo-width": 2,
              }}
            />
          </GeoJSONSource>
        )}

        {/* Drawing overlay for draw/edit modes */}
        {drawingAction !== "select" && (
          <DrawingOverlay
            ref={drawingRef}
            mode={drawingAction === "edit" ? "edit" : "draw-polygon"}
            mapRef={mapRef}
            onCoordinatesChange={onDrawingComplete}
          />
        )}
      </>
    );
  },
);
