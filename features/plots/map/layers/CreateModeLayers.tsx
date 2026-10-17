import { DrawingOverlay } from "@/components/map/DrawingOverlay";
import { MeadowsLayer } from "@/components/map/MeadowsLayer";
import { PlotsLayer } from "@/components/map/PlotsLayer";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import { mergePlotsIntoMeadowGeometry } from "@/features/animals/meadow-geometry";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { hexToRgba } from "@/theme/theme";
import { usePlotsByLocationQuery } from "@/features/federal-plots/federalPlots.hooks";
import {
  GeoJSONSource,
  Layer,
  type LngLat,
} from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

const PARCEL_SEARCH_RADIUS_KM = 4;

export type CreateModeLayersHandle = {
  handleMapPress: (lngLat: LngLat) => void;
};

export const CreateModeLayers = forwardRef<CreateModeLayersHandle>(
  function CreateModeLayers(_props, ref) {
    const theme = useTheme();
    const { mode, dispatch, plots, mapRef, drawingRef } = usePlotsMapContext();
    const { meadows } = useMeadowsQuery();

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

    // Center the parcel search on the current viewport rather than the farm location,
    // so it follows wherever the user has panned/zoomed to before picking a parcel.
    const [parcelSearchCenter, setParcelSearchCenter] = useState<LngLat | null>(
      null,
    );
    useEffect(() => {
      if (drawingAction !== "parcel") {
        setParcelSearchCenter(null);
        return;
      }
      let cancelled = false;
      mapRef.current?.getCenter().then((center) => {
        if (!cancelled) setParcelSearchCenter(center);
      });
      return () => {
        cancelled = true;
      };
    }, [drawingAction, mapRef]);

    const { plots: nearbyParcels } = usePlotsByLocationQuery(
      {
        lat: parcelSearchCenter?.[1] ?? 0,
        lng: parcelSearchCenter?.[0] ?? 0,
      },
      PARCEL_SEARCH_RADIUS_KM,
      drawingAction === "parcel" && parcelSearchCenter !== null,
    );

    const parcelsFeatureCollection = useMemo(
      (): GeoJSON.FeatureCollection => ({
        type: "FeatureCollection",
        features: nearbyParcels
          .filter((parcel) => parcel.geometry.coordinates.length > 0)
          .map((parcel) => ({
            type: "Feature",
            properties: { id: parcel.id },
            geometry: parcel.geometry,
          })),
      }),
      [nearbyParcels],
    );

    // Parcel number label, placed at each parcel's centroid
    const parcelLabelsData = useMemo(
      (): GeoJSON.FeatureCollection => ({
        type: "FeatureCollection",
        features: nearbyParcels
          .filter(
            (parcel) =>
              parcel.geometry.coordinates.length > 0 && parcel.localId,
          )
          .map((parcel) => ({
            type: "Feature",
            properties: { label: parcel.localId },
            geometry: turf.centroid(parcel.geometry).geometry,
          })),
      }),
      [nearbyParcels],
    );

    function handleParcelPress(event: {
      stopPropagation(): void;
      nativeEvent: { features: GeoJSON.Feature[] };
    }) {
      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const parcelId = feature?.properties?.id;
      if (typeof parcelId !== "number") return;
      const parcel = nearbyParcels.find((p) => p.id === parcelId);
      if (!parcel) return;

      const geometry = parcel.geometry;

      // loadCoordinates synchronously triggers onDrawingComplete below, which dispatches its
      // own (bare) SET_CREATE_POLYGON + SET_CREATE_ACTION. Dispatch our richer polygon (with
      // usage/localId/cuttingDate from the registry) afterwards so it applies last and wins.
      const outerRing = geometry.coordinates[0]?.[0];
      if (outerRing && outerRing.length >= 4) {
        const coords: LngLat[] = outerRing
          .slice(0, -1)
          .map((c) => [c[0], c[1]] as LngLat);
        drawingRef.current?.loadCoordinates(coords);
      }

      const centroid = turf.centroid(geometry);
      dispatch({
        type: "SET_CREATE_POLYGON",
        polygon: {
          geometry,
          centroid: centroid.geometry,
          size: parcel.size,
          usage: parcel.usage,
          localId: parcel.localId ?? undefined,
          cuttingDate: parcel.cuttingDate ?? undefined,
        },
      });
      dispatch({ type: "SET_CREATE_ACTION", action: "edit" });
    }

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
        features: [
          {
            type: "Feature",
            properties: { label },
            geometry: newPolygon.centroid,
          },
        ],
      };
    }, [newPolygon, drawingAction]);

    // New polygon preview when in select mode
    const newPolygonData = useMemo((): GeoJSON.FeatureCollection => {
      if (!newPolygon || drawingAction !== "select") {
        return { type: "FeatureCollection", features: [] };
      }
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: newPolygon.geometry,
          },
        ],
      };
    }, [newPolygon, drawingAction]);

    // Selected plots merged the same way they will be saved, so adjacent plots
    // already show up as one area while selecting
    const selectedPlotIdsForPreview =
      mode.type === "create" && drawingAction === "plots"
        ? mode.selectedPlotIds
        : null;
    const mergedSelectionData = useMemo((): GeoJSON.FeatureCollection => {
      if (
        !selectedPlotIdsForPreview ||
        selectedPlotIdsForPreview.length === 0
      ) {
        return { type: "FeatureCollection", features: [] };
      }
      const geometry = mergePlotsIntoMeadowGeometry(
        plots.filter((plot) => selectedPlotIdsForPreview.includes(plot.id)),
      );
      if (!geometry) return { type: "FeatureCollection", features: [] };
      return {
        type: "FeatureCollection",
        features: [{ type: "Feature", properties: {}, geometry }],
      };
    }, [selectedPlotIdsForPreview, plots]);

    if (mode.type !== "create") return null;
    const isMeadow = mode.target === "meadow";

    // Meadow from existing plots: tap toggles a plot. When nested plots overlap,
    // pick the one whose boundary is nearest to the tap point.
    function handlePlotPress(event: {
      stopPropagation(): void;
      nativeEvent: { features: GeoJSON.Feature[]; lngLat: LngLat };
    }) {
      event.stopPropagation();
      const { features, lngLat } = event.nativeEvent;
      let feature: GeoJSON.Feature | undefined;
      if (features.length <= 1) {
        feature = features[0];
      } else {
        const tapPoint = turf.point(lngLat);
        const distances = features.map((f) => {
          if (f.geometry.type !== "Polygon") return Infinity;
          const exteriorRing = turf.lineString(f.geometry.coordinates[0]);
          return (
            turf.nearestPointOnLine(exteriorRing, tapPoint).properties.dist ??
            Infinity
          );
        });
        feature = features[distances.indexOf(Math.min(...distances))];
      }
      const plotId = feature?.properties?.id;
      if (typeof plotId === "string") {
        dispatch({ type: "TOGGLE_CREATE_PLOT", plotId });
      }
    }

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
        const coords: LngLat[] = outerRing
          .slice(0, -1)
          .map((c) => [c[0], c[1]] as LngLat);
        drawingRef.current?.loadCoordinates(coords);
        dispatch({ type: "SET_CREATE_ACTION", action: "edit" });
      }
    }

    return (
      <>
        {/* Background: existing plots; tappable when building a meadow from plots */}
        <PlotsLayer
          plots={plots}
          selectedPlotIds={[]}
          onPlotPress={drawingAction === "plots" ? handlePlotPress : undefined}
          showZoomLabels={drawingAction === "plots"}
        />
        {/* Existing meadows as context, so a new meadow isn't drawn over them */}
        {isMeadow && <MeadowsLayer meadows={meadows ?? []} />}

        {/* Merged preview of the selected plots */}
        {drawingAction === "plots" && (
          <GeoJSONSource
            id="create-meadow-selection"
            data={mergedSelectionData}
          >
            <Layer
              type="fill"
              id="create-meadow-selection-fill"
              paint={{
                "fill-color": hexToRgba(
                  theme.colors.success,
                  theme.map.defaultFillAlpha,
                ),
                "fill-opacity": 1,
              }}
            />
            <Layer
              type="line"
              id="create-meadow-selection-stroke"
              paint={{ "line-color": theme.colors.warning, "line-width": 3 }}
            />
          </GeoJSONSource>
        )}

        {/* Nearby cadastral parcels, tap to pick one */}
        {drawingAction === "parcel" && (
          <GeoJSONSource
            id="create-parcels"
            data={parcelsFeatureCollection}
            onPress={handleParcelPress}
          >
            <Layer
              type="fill"
              id="create-parcels-fill"
              paint={{
                "fill-color": hexToRgba(theme.colors.surface, 0.3),
                "fill-opacity": 1,
              }}
            />
            <Layer
              type="line"
              id="create-parcels-stroke"
              paint={{
                "line-color": "white",
                "line-width": theme.map.defaultStrokeWidth,
              }}
            />
          </GeoJSONSource>
        )}
        {drawingAction === "parcel" && (
          <GeoJSONSource id="create-parcels-labels" data={parcelLabelsData}>
            <Layer
              type="symbol"
              id="create-parcels-labels-text"
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

        {/* New polygon preview in select mode */}
        {newPolygon && drawingAction === "select" ? (
          <>
            <GeoJSONSource
              id="create-preview"
              data={newPolygonData}
              onPress={onSelectPolygon}
            >
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
                paint={{
                  "line-color": "white",
                  "line-width": theme.map.defaultStrokeWidth,
                }}
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

        {/* Drawing overlay for draw/edit modes. Also mounted (inert) during "parcel" browsing
            so drawingRef is already live when a parcel is tapped and loadCoordinates is called. */}
        {(drawingAction === "draw" ||
          drawingAction === "edit" ||
          drawingAction === "parcel") && (
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
