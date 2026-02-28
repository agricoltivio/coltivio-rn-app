import { Button } from "@/components/buttons/Button";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { useAddPlotStore } from "../../add-plots.store";

export function CreateModeControls() {
  const { t } = useTranslation();
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
        {/* Confirm — disabled until polygon is closed and editable */}
        <MaterialCommunityIconButton
          type="accent"
          color={drawingAction === "edit" && newPolygon ? "green" : "gray"}
          iconSize={30}
          icon="check-circle-outline"
          disabled={!(drawingAction === "edit" && newPolygon)}
          onPress={() => {
            dispatch({ type: "SET_CREATE_ACTION", action: "select" });
          }}
        />
        {/* Info */}
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() => navigation.navigate("MapDrawOnboarding", { variant: "draw" })}
        />
      </MapControls>
    );
  }

  // Select mode — bottom action buttons
  return (
    <BottomActionContainer floating>
      <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
        <Button
          style={{ flex: 1 }}
          type="danger"
          title={t("buttons.cancel")}
          fontSize={16}
          onPress={() => {
            addPlotStore.reset();
            dispatch({ type: "EXIT_MODE" });
          }}
        />
        <Button
          style={{ flex: 1 }}
          disabled={!newPolygon}
          title={t("buttons.next")}
          fontSize={16}
          onPress={() => {
            if (newPolygon) {
              addPlotStore.setData(newPolygon);
              navigation.navigate("AddPlotSummary", {});
            }
          }}
        />
      </View>
    </BottomActionContainer>
  );
}
