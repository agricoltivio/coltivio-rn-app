import { Plot } from "@/api/plots.api";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { hexToRgba } from "@/theme/theme";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export function ViewModeLayers() {
  const theme = useTheme();
  const { mode, dispatch, plots } = usePlotsMapContext();
  if (mode.type !== "view") return null;

  const selectedPlotId = mode.selectedPlotId;

  function onPlotPress(plot: Plot) {
    dispatch({
      type: "SELECT_PLOT",
      plotId: selectedPlotId === plot.id ? null : plot.id,
    });
  }

  return (
    <>
      {plots.map((plot) => (
        <MultiPolygon
          key={plot.id}
          polygon={plot.geometry}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor="white"
          fillColor={hexToRgba(
            plot.id === selectedPlotId
              ? theme.colors.success
              : theme.map.defaultFillColor,
            theme.map.defaultFillAlpha,
          )}
          tappable
          onPress={() => onPlotPress(plot)}
        />
      ))}
    </>
  );
}
