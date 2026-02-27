import { PlotsLayer } from "@/components/map/PlotsLayer";
import { useCallback } from "react";
import { usePlotsMapContext } from "../plots-map-mode";

export function ViewModeLayers() {
  const { mode, dispatch, plots } = usePlotsMapContext();

  const selectedPlotId = mode.type === "view" ? mode.selectedPlotId : null;
  const selectedPlotIds = selectedPlotId ? [selectedPlotId] : [];

  const handlePlotPress = useCallback(
    (event: { stopPropagation(): void; nativeEvent: { features: GeoJSON.Feature[] } }) => {
      event.stopPropagation();
      const feature = event.nativeEvent.features[0];
      const plotId = feature?.properties?.id;
      if (typeof plotId === "string") {
        dispatch({
          type: "SELECT_PLOT",
          plotId: selectedPlotId === plotId ? null : plotId,
        });
      }
    },
    [selectedPlotId, dispatch],
  );

  if (mode.type !== "view") return null;

  return (
    <PlotsLayer
      plots={plots}
      selectedPlotIds={selectedPlotIds}
      onPlotPress={handlePlotPress}
    />
  );
}
