import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { MapControls } from "@/features/map/overlays/MapControls";
import React from "react";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { useAddPlotStore } from "../../add-plots.store";
import { CreateModeChooser } from "./CreateModeChooser";
import { useMeadowDraftStore } from "@/features/animals/meadow-draft.store";
import {
  findMeadowGeometryError,
  mergePlotsIntoMeadowGeometry,
} from "@/features/animals/meadow-geometry";
import { useMeadowsQuery } from "@/features/animals/meadows.hooks";
import { round } from "@/utils/math";
import * as turf from "@turf/turf";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

export function CreateModeControls() {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    mode,
    dispatch,
    drawingRef,
    navigation,
    plots,
    exitMeadowFlow,
    meadowFlowOpenedExternally,
  } = usePlotsMapContext();
  const addPlotStore = useAddPlotStore();
  const setMeadowDraft = useMeadowDraftStore((state) => state.setData);
  const { meadows } = useMeadowsQuery();

  if (mode.type !== "create") return null;

  const { drawingAction, newPolygon } = mode;

  // Initial choice between plot/meadow and drawing a new area or picking existing ones
  if (drawingAction === "choose") {
    return <CreateModeChooser />;
  }

  // Validates a meadow geometry and continues to the name drawer
  function submitMeadowGeometry(geometry: GeoJSON.MultiPolygon) {
    const error = findMeadowGeometryError(geometry, meadows ?? []);
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
    setMeadowDraft({ geometry, size: round(turf.area(geometry), 0) });
    navigation.navigate("MeadowSummary", {
      returnTo: meadowFlowOpenedExternally ? "OutdoorScheduleForm" : "map",
    });
  }

  if (mode.target === "meadow") {
    // Selecting existing plots: one ✓ merges them and goes straight to the name drawer
    if (drawingAction === "plots") {
      const hasSelection = mode.selectedPlotIds.length > 0;
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
            color={hasSelection ? "green" : "gray"}
            iconSize={30}
            icon="check-circle-outline"
            disabled={!hasSelection}
            onPress={() => {
              const geometry = mergePlotsIntoMeadowGeometry(
                plots.filter((plot) => mode.selectedPlotIds.includes(plot.id)),
              );
              if (geometry) submitMeadowGeometry(geometry);
            }}
          />
          <MaterialCommunityIconButton
            style={{ backgroundColor: theme.colors.surface }}
            type="accent"
            color="black"
            iconSize={30}
            icon="information-outline"
            onPress={() =>
              navigation.navigate("MapDrawOnboarding", {
                variant: "meadowPlots",
              })
            }
          />
        </MapControls>
      );
    }

    // Free drawing: draw, adjust vertices, ✓ goes to the name drawer
    const canConfirm = drawingAction === "edit" && newPolygon !== null;
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => {
            drawingRef.current?.reset();
            exitMeadowFlow();
          }}
        />
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="undo"
          onPress={() => drawingRef.current?.undo()}
        />
        <MaterialCommunityIconButton
          type="accent"
          color={canConfirm ? "green" : "gray"}
          iconSize={30}
          icon="check-circle-outline"
          disabled={!canConfirm}
          onPress={() => {
            if (newPolygon) submitMeadowGeometry(newPolygon.geometry);
          }}
        />
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.surface }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() =>
            navigation.navigate("MapDrawOnboarding", { variant: "meadowDraw" })
          }
        />
      </MapControls>
    );
  }

  // Browsing nearby cadastral parcels — only a cancel (exits create mode) and info control
  if (drawingAction === "parcel") {
    return (
      <MapControls>
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => dispatch({ type: "EXIT_MODE" })}
        />
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.surface }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() =>
            navigation.navigate("MapDrawOnboarding", { variant: "parcel" })
          }
        />
      </MapControls>
    );
  }

  // Drawing/edit mode — show undo, cancel, and confirm controls
  if (drawingAction === "draw" || drawingAction === "edit") {
    return (
      <MapControls>
        {/* Cancel — exits create mode directly, same as the other modes */}
        <MaterialCommunityIconButton
          type="accent"
          color="black"
          iconSize={30}
          icon="close-circle-outline"
          onPress={() => {
            drawingRef.current?.reset();
            addPlotStore.reset();
            dispatch({ type: "EXIT_MODE" });
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
          style={{ backgroundColor: theme.colors.surface }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() =>
            navigation.navigate("MapDrawOnboarding", { variant: "create" })
          }
        />
      </MapControls>
    );
  }

  return null;
}
