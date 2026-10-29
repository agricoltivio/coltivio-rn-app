import { ApiError } from "@/api/api";
import * as turf from "@turf/turf";
import { TFunction } from "i18next";

// Crossing edges are rejected before saving; the API would repair them into unexpected shapes
export function isSelfIntersecting(geometry: GeoJSON.MultiPolygon) {
  return (
    turf.kinks(turf.multiPolygon(geometry.coordinates)).features.length > 0
  );
}

// Message for a failed plot save, specific when the API returned an error code.
// Falls back to the generic message for codes this app version doesn't know yet.
export function plotSaveErrorMessage(error: Error, t: TFunction) {
  const fallback = t("plots.errors.save_failed");
  return error instanceof ApiError && error.code
    ? t(`plots.errors.${error.code}`, { defaultValue: fallback })
    : fallback;
}
