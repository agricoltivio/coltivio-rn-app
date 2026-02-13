import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { MaterialCommunityIconButton } from "../buttons/IconButton";
import { DrawAction } from "./PolygonDrawingTool";
import { useTheme } from "styled-components/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type CommandPaletteProps = {
  onFinish: () => void;
  onUndo: () => void;
  onDraw: () => void;
  onDelete: () => void;
  onInfo?: () => void;
  action: DrawAction;
  canFinish: boolean;
  finishIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
};
export function CommandPalette({
  onFinish,
  onDraw,
  onUndo,
  onDelete,
  onInfo,
  action,
  canFinish,
  finishIcon,
}: CommandPaletteProps) {
  const theme = useTheme();
  return (
    <MapControls>
      <MaterialCommunityIconButton
        style={{
          backgroundColor:
            action !== "select" ? theme.colors.primary : theme.colors.accent,
        }}
        type="accent"
        color={action !== "select" ? "white" : "black"}
        iconSize={30}
        icon="vector-polygon"
        // disabled={action !== "select"}
        onPress={onDraw}
      />
      <MaterialCommunityIconButton
        type="accent"
        color="black"
        iconSize={30}
        icon="undo-variant"
        disabled={action === "select"}
        onPress={onUndo}
      />
      <MaterialCommunityIconButton
        type="accent"
        color={action !== "select" ? "red" : "black"}
        iconSize={30}
        icon="trash-can-outline"
        disabled={action === "select"}
        onPress={onDelete}
      />
      <MaterialCommunityIconButton
        // type={action === "draw" ? "success" : "accent"}
        type="accent"
        color={"green"}
        iconSize={30}
        icon={finishIcon ?? "check"}
        disabled={action === "select" || !canFinish}
        onPress={onFinish}
      />
      {onInfo && (
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={onInfo}
        />
      )}
    </MapControls>
  );
}
