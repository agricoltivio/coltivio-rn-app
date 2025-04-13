import { useMemo } from "react";
import * as turf from "@turf/turf";
import { useMap } from "@/components/map/Map";

export function useMapRegionAsPolygon() {
  const { region } = useMap();
  const viewportPolygon = useMemo(() => {
    const { longitude, latitude, latitudeDelta, longitudeDelta } = region;

    const west = longitude - longitudeDelta / 2;
    const south = latitude - latitudeDelta / 2;
    const east = longitude + longitudeDelta / 2;
    const north = latitude + latitudeDelta / 2;
    return turf.bboxPolygon([west, south, east, north]);
  }, [region]);
  return viewportPolygon;
}
