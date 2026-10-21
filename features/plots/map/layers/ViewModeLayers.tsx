import { ArchivedAreasLayer } from "@/components/map/ArchivedAreasLayer";
import { MeadowsLayer } from "@/components/map/MeadowsLayer";
import { PlotsLayer } from "@/components/map/PlotsLayer";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import * as turf from "@turf/turf";
import { useCallback } from "react";
import { usePlotsMapContext } from "../plots-map-mode";

export function ViewModeLayers() {
  const {
    mode,
    dispatch,
    plots,
    plotColorMode,
    visibleLayers,
    archivedPlots,
    archivedMeadows,
    selectedMeadowId,
    setSelectedMeadowId,
  } = usePlotsMapContext();
  const { meadows } = useMeadowsQuery();

  const selectedPlotId = mode.type === "view" ? mode.selectedPlotId : null;
  const selectedPlotIds = selectedPlotId ? [selectedPlotId] : [];

  const handlePlotPress = useCallback(
    (event: {
      stopPropagation(): void;
      nativeEvent: { features: GeoJSON.Feature[]; lngLat: [number, number] };
    }) => {
      event.stopPropagation();
      const { features, lngLat } = event.nativeEvent;

      // When multiple overlapping polygons are hit (e.g. nested plots), pick the one
      // whose boundary is nearest to the tap point — this selects the innermost plot.
      let feature: GeoJSON.Feature | undefined;
      if (features.length <= 1) {
        feature = features[0];
      } else {
        const tapPoint = turf.point(lngLat);
        // Precompute distance from tap to each polygon's outer ring boundary
        const distances = features.map((f) => {
          if (f.geometry.type !== "Polygon") return Infinity;
          // Use only the exterior ring (coordinates[0]) to avoid polygonToLine's
          // FeatureCollection return type when the polygon has holes.
          const exteriorRing = turf.lineString(f.geometry.coordinates[0]);
          return (
            turf.nearestPointOnLine(exteriorRing, tapPoint).properties.dist ??
            Infinity
          );
        });
        const minIndex = distances.indexOf(Math.min(...distances));
        feature = features[minIndex];
      }

      const plotId = feature?.properties?.id;
      if (typeof plotId === "string") {
        // Only one plot or meadow is selected at a time
        setSelectedMeadowId(null);
        dispatch({
          type: "SELECT_PLOT",
          plotId: selectedPlotId === plotId ? null : plotId,
        });
      }
    },
    [selectedPlotId, dispatch, setSelectedMeadowId],
  );

  if (mode.type !== "view") return null;

  // Every visible layer is tappable; meadows render above plots so taps inside a meadow hit it.
  // Archived areas render below both, and only for the visible kinds.
  return (
    <>
      {visibleLayers.archived && (
        <ArchivedAreasLayer
          plots={visibleLayers.plots ? archivedPlots : []}
          meadows={visibleLayers.meadows ? archivedMeadows : []}
          selectedId={selectedPlotId ?? selectedMeadowId}
          onPress={(area) => {
            if (area.kind === "plot") {
              setSelectedMeadowId(null);
              dispatch({
                type: "SELECT_PLOT",
                plotId: selectedPlotId === area.id ? null : area.id,
              });
              return;
            }
            dispatch({ type: "SELECT_PLOT", plotId: null });
            setSelectedMeadowId(selectedMeadowId === area.id ? null : area.id);
          }}
        />
      )}
      {visibleLayers.plots && (
        <PlotsLayer
          plots={plots}
          selectedPlotIds={selectedPlotIds}
          onPlotPress={handlePlotPress}
          showZoomLabels
          plotColorMode={plotColorMode}
        />
      )}
      {visibleLayers.meadows && (
        <MeadowsLayer
          meadows={meadows ?? []}
          selectedMeadowId={selectedMeadowId}
          onMeadowPress={(meadowId) => {
            dispatch({ type: "SELECT_PLOT", plotId: null });
            setSelectedMeadowId(
              selectedMeadowId === meadowId ? null : meadowId,
            );
          }}
        />
      )}
    </>
  );
}
