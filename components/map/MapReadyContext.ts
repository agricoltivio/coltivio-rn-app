import { createContext, useContext } from "react";

// Whether maplibre has finished loading the map (onDidFinishLoadingMap), provided by
// MapLibreMap. Before that, the native sources aren't registered and calls on a source
// ref (e.g. setFeatureState) fail with "Invalid reactTag ..., could not find MLRNGeoJSONSource".
// Defaults to true outside MapLibreMap, so a source rendered elsewhere isn't blocked.
export const MapReadyContext = createContext(true);

export function useMapReady() {
  return useContext(MapReadyContext);
}
