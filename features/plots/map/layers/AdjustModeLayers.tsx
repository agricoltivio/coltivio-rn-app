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
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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

    const ringsRef = useRef(rings);
    ringsRef.current = rings;

    // Keep a ref to the current active ring index sourced from mode state,
    // so imperative callbacks don't have stale closures.
    const activeRingIndex = mode.type === "adjust" ? mode.activeRingIndex : 0;
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

    // Load all polygon rings when entering adjust mode (plot changes)
    useEffect(() => {
      if (!plot) return;
      const loadedRings: RingData[] = plot.geometry.coordinates.map(
        (polyCoords) => {
          const outerRing = polyCoords[0];
          if (!outerRing || outerRing.length < 4) return { coordinates: [] };
          // Drop closing coordinate
          const coords: LngLat[] = outerRing
            .slice(0, -1)
            .map((c) => [c[0], c[1]] as LngLat);
          return { coordinates: coords };
        },
      );
      setRings(loadedRings);
      ringsRef.current = loadedRings;
      // Load first ring into DrawingOverlay
      if (loadedRings.length > 0 && loadedRings[0].coordinates.length > 0) {
        requestAnimationFrame(() => {
          drawingRef.current?.loadCoordinates(loadedRings[0].coordinates);
        });
      }
    }, [plot?.id]);

    // When mode.activeRingIndex advances (via ADVANCE_ADJUST_RING dispatch),
    // load the new ring's coordinates into the DrawingOverlay.
    useEffect(() => {
      if (mode.type !== "adjust") return;
      const ring = ringsRef.current[mode.activeRingIndex];
      if (ring && ring.coordinates.length > 0) {
        drawingRef.current?.loadCoordinates(ring.coordinates);
      }
    }, [mode.type === "adjust" ? mode.activeRingIndex : -1]);

    useImperativeHandle(ref, () => ({
      handleMapPress(_lngLat: LngLat) {
        // In adjust mode the drawing is always closed, so handleMapTap is a no-op.
        // Tap-to-switch-ring is intentionally removed — rings cycle sequentially via confirm.
      },
      handleConfirm() {
        if (!plot) return;

        // Save the current ring's edited coordinates into the rings array
        const currentCoords = drawingRef.current?.getCoordinates();
        const currentRings = ringsRef.current.map((r, i) =>
          i === activeRingRef.current && currentCoords
            ? { coordinates: currentCoords }
            : r,
        );
        setRings(currentRings);
        ringsRef.current = currentRings;

        const nextIndex = activeRingRef.current + 1;
        if (nextIndex < currentRings.length) {
          // More rings remain — advance to the next one
          dispatch({ type: "ADVANCE_ADJUST_RING" });
          // Load next ring into DrawingOverlay (useEffect above also handles this,
          // but dispatching is async so we load immediately for responsiveness)
          const nextRing = currentRings[nextIndex];
          if (nextRing && nextRing.coordinates.length > 0) {
            drawingRef.current?.loadCoordinates(nextRing.coordinates);
          }
        } else {
          // Last ring confirmed — build the full multipolygon and save
          const finalRings = currentRings.map((r) => r.coordinates);
          const polygon = GeoSpatials.lngLatToMultiPolygon(finalRings);
          const area = turf.area(polygon);
          updatePlotMutation.mutate({
            plotId: plot.id,
            data: { size: round(area, 0), geometry: polygon },
          });
        }
      },
    }));

    // GeoJSON for inactive rings — shown as dimmed outlines while user edits another ring
    const inactiveRingsData = useMemo((): GeoJSON.FeatureCollection => {
      const features: GeoJSON.Feature[] = [];
      for (let i = 0; i < rings.length; i++) {
        if (i === activeRingIndex) continue;
        const ring = rings[i];
        if (ring.coordinates.length < 3) continue;
        const closed = [
          ...ring.coordinates.map((c) => [c[0], c[1]]),
          [ring.coordinates[0][0], ring.coordinates[0][1]],
        ];
        features.push({
          type: "Feature",
          properties: { ringIndex: i },
          geometry: { type: "Polygon", coordinates: [closed] },
        });
      }
      return { type: "FeatureCollection", features };
    }, [rings, activeRingIndex]);

    if (mode.type !== "adjust" || !plot) return null;

    return (
      <>
        <PlotsLayer plots={plots} />

        {/* Inactive rings — dimmed dashed outline so the user can see the full shape */}
        <GeoJSONSource id="adjust-inactive-rings" data={inactiveRingsData}>
          <Layer
            type="fill"
            id="adjust-inactive-fill"
            paint={{ "fill-color": "#4CAF50", "fill-opacity": 0.1 }}
          />
          <Layer
            type="line"
            id="adjust-inactive-stroke"
            paint={{
              "line-color": "#4CAF50",
              "line-width": 2,
              "line-dasharray": [2, 2],
            }}
          />
        </GeoJSONSource>

        {/* Active ring — full DrawingOverlay with draggable vertex editing */}
        <DrawingOverlay ref={drawingRef} mode="edit" mapRef={mapRef} />
      </>
    );
  },
);
