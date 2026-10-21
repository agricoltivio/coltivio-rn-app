import { DrawingOverlay } from "@/components/map/DrawingOverlay";
import { MeadowsLayer } from "@/components/map/MeadowsLayer";
import { PlotsLayer } from "@/components/map/PlotsLayer";
import { ringToOpenLngLat } from "@/features/animals/meadow-geometry";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import React, { useMemo } from "react";
import { usePlotsMapContext } from "../plots-map-mode";

export function MeadowAdjustModeLayers() {
  const { mode, plots, mapRef, drawingRef } = usePlotsMapContext();
  const { meadows } = useMeadowsQuery();

  const meadowId = mode.type === "meadowAdjust" ? mode.meadowId : null;
  const activePartIndex =
    mode.type === "meadowAdjust" ? mode.activePartIndex : 0;
  const editedParts = mode.type === "meadowAdjust" ? mode.editedParts : null;
  const meadow = meadows?.find((m) => m.id === meadowId);

  // Parts not currently being edited — already edited ones show their new shape
  const inactivePartsData = useMemo((): GeoJSON.FeatureCollection => {
    if (!meadow || !editedParts) {
      return { type: "FeatureCollection", features: [] };
    }
    return {
      type: "FeatureCollection",
      features: meadow.geometry.coordinates
        .map((savedPart, index) => editedParts[index] ?? savedPart)
        .filter((_, index) => index !== activePartIndex)
        .map((part) => ({
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: part },
        })),
    };
  }, [meadow, editedParts, activePartIndex]);

  if (mode.type !== "meadowAdjust") return null;

  const activePart = meadow?.geometry.coordinates[activePartIndex];

  return (
    <>
      <PlotsLayer plots={plots} />
      <MeadowsLayer meadows={meadows ?? []} excludeMeadowId={mode.meadowId} />

      {/* Other parts of this meadow — dashed outline so the full shape stays visible */}
      <GeoJSONSource id="meadow-adjust-inactive-parts" data={inactivePartsData}>
        <Layer
          type="line"
          id="meadow-adjust-inactive-stroke"
          paint={{
            "line-color": "#FFFFFF",
            "line-width": 2,
            "line-dasharray": [2, 2],
          }}
        />
      </GeoJSONSource>

      {/* Keyed per part so the overlay starts fresh with that part's outline */}
      {activePart && (
        <DrawingOverlay
          key={`meadow-part-${activePartIndex}`}
          ref={drawingRef}
          mode="edit"
          mapRef={mapRef}
          initialCoordinates={ringToOpenLngLat(activePart[0])}
        />
      )}
    </>
  );
}
