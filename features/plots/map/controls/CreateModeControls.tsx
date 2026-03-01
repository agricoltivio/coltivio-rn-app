import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { useAddPlotStore } from "../../add-plots.store";

export function CreateModeControls() {
  const theme = useTheme();
  const { mode, dispatch, drawingRef, navigation } = usePlotsMapContext();
  const addPlotStore = useAddPlotStore();

  if (mode.type !== "create") return null;

  const { drawingAction, newPolygon } = mode;

  // Drawing/edit mode — show undo, cancel, and confirm controls
  if (drawingAction === "draw" || drawingAction === "edit") {
    return (
      <MapControls>
        {/* Cancel */}
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => {
            drawingRef.current?.reset();
            if (drawingAction === "draw") {
              // No polygon yet — exit create mode entirely
              addPlotStore.reset();
              dispatch({ type: "EXIT_MODE" });
            } else {
              // Editing existing polygon — reset drawing and go back to draw mode
              dispatch({ type: "SET_CREATE_POLYGON", polygon: null });
              dispatch({ type: "SET_CREATE_ACTION", action: "draw" });
            }
          }}
        />
        {/* Undo */}
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        {/* Confirm — disabled until polygon is closed and editable; skips select mode */}
        <MaterialCommunityIconButton
          type="accent"
          color={drawingAction === "edit" && newPolygon ? "green" : "gray"}
          iconSize={30}
          icon="check-circle-outline"
          disabled={!(drawingAction === "edit" && newPolygon)}
          onPress={() => {
            if (newPolygon) {
              addPlotStore.setData(newPolygon);
              navigation.navigate("AddPlotSummary", {});
            }
          }}
        />
        {/* Info */}
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() => navigation.navigate("MapDrawOnboarding", { variant: "create" })}
        />
      </MapControls>
    );
  }

  return null;
}
