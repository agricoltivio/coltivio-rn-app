import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { useAddPlotStore } from "../../add-plots.store";

export function CreateModeControls() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, dispatch, navigation } = usePlotsMapContext();
  const addPlotStore = useAddPlotStore();

  if (mode.type !== "create") return null;

  const { newPolygon } = mode;

  // Use bottom floating buttons to avoid overlapping with PolygonDrawingTool's
  // own CommandPalette which also uses MapControls
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
