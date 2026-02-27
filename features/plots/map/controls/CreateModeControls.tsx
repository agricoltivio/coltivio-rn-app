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
        {/* Cancel — reset drawing and go back to draw mode */}
        <MaterialCommunityIconButton
          type="accent"
          color="red"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => {
            drawingRef.current?.reset();
            dispatch({ type: "SET_CREATE_POLYGON", polygon: null });
            dispatch({ type: "SET_CREATE_ACTION", action: "draw" });
          }}
        />
        {/* Undo */}
        <MaterialCommunityIconButton
          type="accent"
          color="white"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        {/* Confirm — only in edit mode when polygon exists */}
        {drawingAction === "edit" && newPolygon && (
          <MaterialCommunityIconButton
            type="accent"
            color="green"
            iconSize={30}
            icon="check-circle-outline"
            onPress={() => {
              // Re-compute polygon from current drawing coordinates
              dispatch({ type: "SET_CREATE_ACTION", action: "select" });
            }}
          />
        )}
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
