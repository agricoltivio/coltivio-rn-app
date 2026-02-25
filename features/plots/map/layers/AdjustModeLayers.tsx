import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import * as turf from "@turf/turf";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { LatLng, MapPressEvent } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";
import { useUpdatePlotMutation } from "../../plots.hooks";

export type AdjustModeLayersHandle = {
  handleMapPress: (event: MapPressEvent) => void;
  handleConfirm: () => void;
};

export const AdjustModeLayers = forwardRef<AdjustModeLayersHandle>(
  function AdjustModeLayers(_props, ref) {
    const theme = useTheme();
    const { mode, dispatch, plots, navigation } = usePlotsMapContext();
    const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);
    const [drawingAction, setDrawingAction] = useState<"edit" | "draw" | "select">("edit");
    const [polygonIndex, setPolygonIndex] = useState(0);
    const [editedCoordinates, setEditedCoordinates] = useState<LatLng[][]>([]);

    const updatePlotMutation = useUpdatePlotMutation(
      () => dispatch({ type: "EXIT_MODE" }),
      (error) => console.error(error),
    );

    const plot =
      mode.type === "adjust"
        ? plots.find((p) => p.id === mode.plotId)
        : undefined;

    useImperativeHandle(ref, () => ({
      handleMapPress(event: MapPressEvent) {
        if (drawingAction === "draw") {
          event.stopPropagation();
          polygonDrawingToolRef.current?.drawToPoint(
            event.nativeEvent.coordinate,
          );
        }
      },
      handleConfirm() {
        if (!plot) return;
        const coordinates = polygonDrawingToolRef.current?.coordinates;
        if (coordinates) {
          onFinishDrawing(coordinates);
        }
      },
    }));

    function onFinishDrawing(coordinates: LatLng[]) {
      if (!plot) return;
      // Handle multi-polygon plots by iterating through polygon rings
      if (polygonIndex < plot.geometry.coordinates.length - 1) {
        polygonDrawingToolRef.current?.editPolygon(
          GeoSpatials.coordinatesToLatLng(
            plot.geometry.coordinates[polygonIndex + 1][0],
          ),
        );
        setEditedCoordinates((prev) => [...prev, coordinates]);
        setPolygonIndex((prev) => prev + 1);
      } else {
        const finalCoordinates = [...editedCoordinates, coordinates];
        const polygon = GeoSpatials.latLngToMultiPolygon(finalCoordinates);
        const area = turf.area(polygon);
        // Save directly
        updatePlotMutation.mutate({
          plotId: plot.id,
          data: {
            size: round(area, 0),
            geometry: polygon,
          },
        });
      }
    }

    if (mode.type !== "adjust" || !plot) return null;

    const plotPolygons = plots.map((p) => (
      <MultiPolygon
        key={p.id}
        polygon={p.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor="white"
        fillColor={hexToRgba(
          theme.map.defaultFillColor,
          theme.map.defaultFillAlpha,
        )}
      />
    ));

    return (
      <>
        {plotPolygons}
        <PolygonDrawingTool
          initialAction="edit"
          initialPolygonCoordinates={plot.geometry.coordinates[0][0].map(
            ([longitude, latitude]) => ({
              longitude,
              latitude,
            }),
          )}
          portalName="PlotsMapPortal"
          ref={polygonDrawingToolRef}
          showActions={false}
          onDrawActionChange={(action) => setDrawingAction(action)}
          magnifierMapContent={plotPolygons}
          onFinish={onFinishDrawing}
          onInfo={() =>
            navigation.navigate("MapDrawOnboarding", { variant: "edit" })
          }
        />
      </>
    );
  },
);
