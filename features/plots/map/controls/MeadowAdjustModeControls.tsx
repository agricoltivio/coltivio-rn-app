import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { Text } from "@/components/text/Text";
import {
  findMeadowGeometryError,
  openLngLatToRing,
} from "@/features/animals/meadow-geometry";
import {
  useMeadowsQuery,
  useUpdateMeadowMutation,
} from "@/features/animals/meadows.hooks";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export function MeadowAdjustModeControls() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, dispatch, drawingRef, exitMeadowFlow } = usePlotsMapContext();
  const { meadows } = useMeadowsQuery();
  const updateMeadowMutation = useUpdateMeadowMutation(
    () => exitMeadowFlow(),
    () => Alert.alert(t("common.error"), t("common.unknown_error")),
  );

  if (mode.type !== "meadowAdjust") return null;

  const meadow = meadows?.find((m) => m.id === mode.meadowId);
  const totalParts = meadow?.geometry.coordinates.length ?? 1;
  const isLastPart = mode.activePartIndex >= totalParts - 1;

  function handleConfirm() {
    if (mode.type !== "meadowAdjust" || !meadow) return;
    const coordinates = drawingRef.current?.getCoordinates();
    if (!coordinates || coordinates.length < 3) return;
    // Holes can't be edited in the overlay; keep them from the saved part
    const savedPart = meadow.geometry.coordinates[mode.activePartIndex];
    const editedPart = [openLngLatToRing(coordinates), ...savedPart.slice(1)];

    if (!isLastPart) {
      dispatch({ type: "ADVANCE_MEADOW_PART", editedPart });
      return;
    }

    const geometry: GeoJSON.MultiPolygon = {
      type: "MultiPolygon",
      coordinates: [...mode.editedParts, editedPart],
    };
    const error = findMeadowGeometryError(
      geometry,
      (meadows ?? []).filter((m) => m.id !== meadow.id),
    );
    if (error?.kind === "self_intersecting") {
      Alert.alert(t("animals.meadows.errors.self_intersecting"));
      return;
    }
    if (error?.kind === "overlaps") {
      Alert.alert(
        t("animals.meadows.errors.overlaps", { name: error.meadowName }),
      );
      return;
    }
    updateMeadowMutation.mutate({ id: meadow.id, geometry });
  }

  return (
    <MapControls>
      <MaterialCommunityIconButton
        type="accent"
        color="black"
        iconSize={30}
        icon="close-circle-outline"
        onPress={exitMeadowFlow}
      />
      <MaterialCommunityIconButton
        type="accent"
        color="black"
        iconSize={30}
        icon="undo"
        onPress={() => drawingRef.current?.undo()}
      />
      {/* Part counter — only shown for multi-part meadows */}
      {totalParts > 1 && (
        <Text
          style={{
            color: theme.colors.primary,
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          {mode.activePartIndex + 1}/{totalParts}
        </Text>
      )}
      {/* Confirm current part or advance to the next */}
      <MaterialCommunityIconButton
        type="accent"
        color={updateMeadowMutation.isPending ? "gray" : "green"}
        iconSize={30}
        icon={
          isLastPart ? "check-circle-outline" : "arrow-right-circle-outline"
        }
        disabled={updateMeadowMutation.isPending}
        onPress={handleConfirm}
      />
    </MapControls>
  );
}
