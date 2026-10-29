import { ArchivedAreasLayer } from "@/components/map/ArchivedAreasLayer";
import { MeadowsLayer } from "@/components/map/MeadowsLayer";
import { PlotsLayer } from "@/components/map/PlotsLayer";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import { type LngLat } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import { useCallback } from "react";
import { type AreaChoiceOption, usePlotsMapContext } from "../plots-map-mode";

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
    setAreaChoiceOptions,
  } = usePlotsMapContext();
  const { meadows } = useMeadowsQuery();

  const selectedPlotId = mode.type === "view" ? mode.selectedPlotId : null;
  const selectedPlotIds = selectedPlotId ? [selectedPlotId] : [];

  // Resolves a tap on a plot or meadow. The native hit test has a few pixels of tolerance,
  // so near a border it can report a neighbouring area; the areas that actually contain
  // the tap point decide. Several of them (e.g. a meadow over plots): ask which one.
  // None of them (tap just outside the border): fall back to the native hit.
  const handleAreaTap = useCallback(
    (lngLat: LngLat, nativeHit: { kind: "plot" | "meadow"; id: string }) => {
      const tapPoint = turf.point(lngLat);
      const options: AreaChoiceOption[] = [];
      if (visibleLayers.meadows) {
        for (const meadow of meadows ?? []) {
          if (turf.booleanPointInPolygon(tapPoint, meadow.geometry)) {
            options.push({
              kind: "meadow",
              id: meadow.id,
              name: meadow.name,
              size: meadow.size,
            });
          }
        }
      }
      if (visibleLayers.plots) {
        for (const plot of plots) {
          if (turf.booleanPointInPolygon(tapPoint, plot.geometry)) {
            options.push({
              kind: "plot",
              id: plot.id,
              name: plot.name,
              size: plot.size,
            });
          }
        }
      }

      if (options.length > 1) {
        setSelectedMeadowId(null);
        dispatch({ type: "SELECT_PLOT", plotId: null });
        setAreaChoiceOptions(options);
        return;
      }

      // Only one plot or meadow is selected at a time; tapping the selected one deselects it
      const tappedArea = options[0] ?? nativeHit;
      if (tappedArea.kind === "meadow") {
        dispatch({ type: "SELECT_PLOT", plotId: null });
        setSelectedMeadowId(
          selectedMeadowId === tappedArea.id ? null : tappedArea.id,
        );
      } else {
        setSelectedMeadowId(null);
        dispatch({
          type: "SELECT_PLOT",
          plotId: selectedPlotId === tappedArea.id ? null : tappedArea.id,
        });
      }
    },
    [
      visibleLayers.meadows,
      visibleLayers.plots,
      meadows,
      plots,
      selectedPlotId,
      selectedMeadowId,
      dispatch,
      setSelectedMeadowId,
      setAreaChoiceOptions,
    ],
  );

  const handlePlotPress = useCallback(
    (event: {
      stopPropagation(): void;
      nativeEvent: { features: GeoJSON.Feature[]; lngLat: LngLat };
    }) => {
      event.stopPropagation();
      const { features, lngLat } = event.nativeEvent;
      const plotId = features[0]?.properties?.id;
      if (typeof plotId === "string") {
        handleAreaTap(lngLat, { kind: "plot", id: plotId });
      }
    },
    [handleAreaTap],
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
          onMeadowPress={(meadowId, lngLat) =>
            handleAreaTap(lngLat, { kind: "meadow", id: meadowId })
          }
        />
      )}
    </>
  );
}
