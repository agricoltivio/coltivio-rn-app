import { ApiError } from "@/api/api";
import * as turf from "@turf/turf";
import { TFunction } from "i18next";

// Crossing edges are rejected before saving; the API would repair them into unexpected shapes.
// Checked per part: parts of a merged plot share edges, which kinks() reports on the whole MultiPolygon.
// Duplicate points are removed first: kinks() reports them as crossings, and cut plots can contain them.
export function isSelfIntersecting(geometry: GeoJSON.MultiPolygon) {
  return geometry.coordinates.some((part) => {
    try {
      return (
        turf.kinks(turf.cleanCoords(turf.polygon(part))).features.length > 0
      );
    } catch {
      // The part collapses to a line (no area); the API rejects it with invalid_geometry
      return false;
    }
  });
}

// Adds the holes of the saved plot (e.g. a stream or pond cut out of it) to the adjusted outer rings, which can't
// edit holes. A hole the adjusted outline no longer touches is dropped, it would cut nothing out; a hole that
// crosses the outline is kept, so isSelfIntersecting rejects it.
export function withSavedHoles(
  outerRings: GeoJSON.Position[][],
  savedGeometry: GeoJSON.MultiPolygon,
): GeoJSON.MultiPolygon {
  return {
    type: "MultiPolygon",
    coordinates: outerRings.map((outerRing, partIndex) => {
      const savedHoles = savedGeometry.coordinates[partIndex]?.slice(1) ?? [];
      if (outerRing.length < 4) return [outerRing, ...savedHoles];
      const outerPolygon = turf.polygon([outerRing]);
      return [
        outerRing,
        ...savedHoles.filter((hole) =>
          turf.booleanIntersects(turf.polygon([hole]), outerPolygon),
        ),
      ];
    }),
  };
}

// Message for a failed plot save, specific when the API returned an error code.
// Falls back to the generic message for codes this app version doesn't know yet.
export function plotSaveErrorMessage(error: Error, t: TFunction) {
  const fallback = t("plots.errors.save_failed");
  return error instanceof ApiError && error.code
    ? t(`plots.errors.${error.code}`, { defaultValue: fallback })
    : fallback;
}
