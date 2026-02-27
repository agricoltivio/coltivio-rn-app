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
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { usePlotsMapContext } from "../plots-map-mode";
import { useUpdatePlotMutation } from "../../plots.hooks";

export type AdjustModeLayersHandle = {
  handleMapPress: (lngLat: LngLat) => void;
  handleConfirm: () => void;
};

type RingData = {
  coordinates: LngLat[];
};

export const AdjustModeLayers = forwardRef<AdjustModeLayersHandle>(
  function AdjustModeLayers(_props, ref) {
    const { mode, dispatch, plots, mapRef, drawingRef } = usePlotsMapContext();
    const [rings, setRings] = useState<RingData[]>([]);
    const [activeRingIndex, setActiveRingIndex] = useState(0);

    const ringsRef = useRef(rings);
    ringsRef.current = rings;
    const activeRingRef = useRef(activeRingIndex);
    activeRingRef.current = activeRingIndex;

    const updatePlotMutation = useUpdatePlotMutation(
      () => dispatch({ type: "EXIT_MODE" }),
      (error) => console.error(error),
    );

    const plot =
      mode.type === "adjust"
        ? plots.find((p) => p.id === mode.plotId)
        : undefined;

    // Load all polygon rings when entering adjust mode
    useEffect(() => {
      if (!plot) return;
      const loadedRings: RingData[] = plot.geometry.coordinates.map((polyCoords) => {
        const outerRing = polyCoords[0];
        if (!outerRing || outerRing.length < 4) return { coordinates: [] };
        // Drop closing coordinate
        const coords: LngLat[] = outerRing.slice(0, -1).map((c) => [c[0], c[1]] as LngLat);
        return { coordinates: coords };
      });
      setRings(loadedRings);
      setActiveRingIndex(0);
      // Load first ring into DrawingOverlay
      if (loadedRings.length > 0 && loadedRings[0].coordinates.length > 0) {
        // Defer to next frame so DrawingOverlay is mounted
        requestAnimationFrame(() => {
          drawingRef.current?.loadCoordinates(loadedRings[0].coordinates);
        });
      }
    }, [plot?.id]);

    // Save current DrawingOverlay coords back to rings state, then load new ring
    function switchToRing(newIndex: number) {
      const currentRings = [...ringsRef.current];
      const currentActive = activeRingRef.current;
      if (newIndex === currentActive || newIndex < 0 || newIndex >= currentRings.length) return;

      // Save current drawing coordinates
      const currentCoords = drawingRef.current?.getCoordinates();
      if (currentCoords) {
        currentRings[currentActive] = { coordinates: currentCoords };
      }

      setRings(currentRings);
      ringsRef.current = currentRings;
      setActiveRingIndex(newIndex);
      activeRingRef.current = newIndex;

      // Load new ring into DrawingOverlay
      const newRing = currentRings[newIndex];
      if (newRing && newRing.coordinates.length > 0) {
        drawingRef.current?.loadCoordinates(newRing.coordinates);
      }
    }

    useImperativeHandle(ref, () => ({
      handleMapPress(lngLat: LngLat) {
        // Check if tap is on an inactive ring to switch to it
        const currentRings = ringsRef.current;
        const currentActive = activeRingRef.current;
        for (let i = 0; i < currentRings.length; i++) {
          if (i === currentActive) continue;
          const ring = currentRings[i];
          if (ring.coordinates.length < 3) continue;
          const closed = [...ring.coordinates.map((c) => [c[0], c[1]]), [ring.coordinates[0][0], ring.coordinates[0][1]]];
          const poly = turf.polygon([closed]);
          if (turf.booleanPointInPolygon(turf.point(lngLat), poly)) {
            switchToRing(i);
            return;
          }
        }
        // Default: pass tap to DrawingOverlay
        drawingRef.current?.handleMapTap(lngLat);
      },
      handleConfirm() {
        if (!plot) return;
        // Save current active ring coordinates
        const currentCoords = drawingRef.current?.getCoordinates();
        const finalRings = ringsRef.current.map((r, i) => {
          if (i === activeRingRef.current && currentCoords) {
            return currentCoords;
          }
          return r.coordinates;
        });
        const polygon = GeoSpatials.lngLatToMultiPolygon(finalRings);
        const area = turf.area(polygon);
        updatePlotMutation.mutate({
          plotId: plot.id,
          data: {
            size: round(area, 0),
            geometry: polygon,
          },
        });
      },
    }));

    // Build GeoJSON for inactive rings — fill + stroke
    const inactiveRingsData = useMemo((): GeoJSON.FeatureCollection => {
      const features: GeoJSON.Feature[] = [];
      for (let i = 0; i < rings.length; i++) {
        if (i === activeRingIndex) continue;
        const ring = rings[i];
        if (ring.coordinates.length < 3) continue;
        const closed = [...ring.coordinates.map((c) => [c[0], c[1]]), [ring.coordinates[0][0], ring.coordinates[0][1]]];
        features.push({
          type: "Feature",
          properties: { ringIndex: i },
          geometry: { type: "Polygon", coordinates: [closed] },
        });
      }
      return { type: "FeatureCollection", features };
    }, [rings, activeRingIndex]);

    // Vertices for inactive rings — small dots to show they're tappable
    const inactiveVerticesData = useMemo((): GeoJSON.FeatureCollection => {
      const features: GeoJSON.Feature[] = [];
      for (let i = 0; i < rings.length; i++) {
        if (i === activeRingIndex) continue;
        for (const coord of rings[i].coordinates) {
          features.push({
            type: "Feature",
            properties: { ringIndex: i },
            geometry: { type: "Point", coordinates: coord },
          });
        }
      }
      return { type: "FeatureCollection", features };
    }, [rings, activeRingIndex]);

    if (mode.type !== "adjust" || !plot) return null;

    return (
      <>
        <PlotsLayer plots={plots} />

        {/* Inactive rings — dimmed with dashed outline */}
        <GeoJSONSource id="adjust-inactive-rings" data={inactiveRingsData}>
          <Layer
            type="fill"
            id="adjust-inactive-fill"
            paint={{ "fill-color": "#4CAF50", "fill-opacity": 0.1 }}
          />
          <Layer
            type="line"
            id="adjust-inactive-stroke"
            paint={{ "line-color": "#4CAF50", "line-width": 2, "line-dasharray": [2, 2] }}
          />
        </GeoJSONSource>
        <GeoJSONSource id="adjust-inactive-vertices" data={inactiveVerticesData}>
          <Layer
            type="circle"
            id="adjust-inactive-vertices-circle"
            paint={{
              "circle-radius": 5,
              "circle-color": "#888888",
              "circle-stroke-color": "#4CAF50",
              "circle-stroke-width": 1.5,
            }}
          />
        </GeoJSONSource>

        {/* Active ring — full DrawingOverlay with vertex editing */}
        <DrawingOverlay
          ref={drawingRef}
          mode="edit"
          mapRef={mapRef}
        />
      </>
    );
  },
);
